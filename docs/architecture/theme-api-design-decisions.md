# Theme API Design Decisions

## Executive Summary

Modernized existing theme preference API endpoint at `/api/children/[id]/theme` with production-ready security, validation, and error handling following Next.js 14 and Supabase best practices.

## Design Decision: Dedicated Endpoint vs Extension

### Decision: Use Dedicated Theme Endpoint

**Path**: `PATCH /api/children/[id]/theme`

### Rationale

#### Advantages of Dedicated Endpoint
1. **API Semantics**: Clear intent - this endpoint only handles theme updates
2. **Separation of Concerns**: Theme logic isolated from general child updates
3. **Easier Analytics**: Track theme changes separately from other updates
4. **Versioning**: Can version theme API independently
5. **Client Code Clarity**: `updateTheme()` vs `updateChild({ theme })`

#### When to Use Alternative
The general endpoint `/api/children/[id]` with PATCH supports theme updates:
```typescript
PATCH /api/children/[id]
{
  "name": "Emma",
  "theme_preference": "young",
  "age_group": "5-8"
}
```

Use this when updating multiple child properties simultaneously.

## Security Architecture

### Defense in Depth Strategy

#### Layer 1: Authentication
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
```
- **Method**: `getUser()` instead of `getSession()` (more secure)
- **Why**: Validates token freshness, prevents replay attacks
- **Modernization**: Replaced deprecated `createRouteHandlerClient`

#### Layer 2: Authorization - Role Check
```typescript
if (familyMember.role !== 'parent' && familyMember.role !== 'admin')
```
- **Requirement**: Only parents and admins can modify themes
- **Prevents**: Children or guests from changing themes
- **Business Logic**: Enforces parental control

#### Layer 3: Authorization - Family Boundary
```typescript
.eq('family_id', familyMember.family_id)
```
- **Requirement**: Child must belong to user's family
- **Prevents**: Cross-family data access
- **Data Isolation**: Maintains multi-tenancy

#### Layer 4: Row-Level Security (Database)
- **Enforcement**: Supabase RLS policies at database level
- **Redundancy**: Defense even if application logic fails
- **Compliance**: Database-enforced data isolation

### Security Improvements from Original

| Aspect | Original | Modernized |
|--------|----------|------------|
| Auth Method | `getSession()` | `getUser()` (more secure) |
| Client Creation | `createRouteHandlerClient` | `createClient()` (current) |
| Role Check | Missing | Parent/admin verification |
| Error Messages | Generic | Specific, user-friendly |
| Params Handling | Synchronous | Async (Next.js 14 requirement) |

## Validation Strategy

### Input Validation
```typescript
const ThemeUpdateSchema = z.object({
  theme_preference: z.enum(['age-default', 'young', 'older'], {
    errorMap: () => ({ message: 'Theme must be age-default, young, or older' })
  }),
})
```

#### Design Choices
- **Zod Schema**: Type-safe runtime validation
- **Custom Error Messages**: User-friendly validation errors
- **Enum Constraint**: Prevents invalid theme values at type level
- **TypeScript Export**: Enables client-side type checking

### Output Validation
```typescript
.select('id, name, age_group, theme_preference, profile_photo_url, family_id, created_at')
```

#### Design Choices
- **Explicit Fields**: Only return necessary data
- **No Wildcards**: Prevents accidental data leakage
- **Consistent Schema**: Matches ChildSchema from shared schemas
- **Type Safety**: TypeScript knows exact return shape

## Error Handling Architecture

### Error Classification

#### Client Errors (4xx)
```typescript
400 Bad Request     → Invalid input data
401 Unauthorized    → Not authenticated
403 Forbidden       → Wrong role (not parent/admin)
404 Not Found       → Child or family not found
```

#### Server Errors (5xx)
```typescript
500 Internal Server Error → Database errors, unexpected exceptions
```

### Error Response Structure
```json
{
  "error": "Error type",
  "message": "User-friendly description",
  "details": [] // Optional: Validation details
}
```

### Structured Error Handling
```typescript
// Validation errors
if (error instanceof z.ZodError) {
  return NextResponse.json({
    error: 'Invalid input',
    details: error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }))
  }, { status: 400 })
}
```

#### Benefits
- **Client Debugging**: Detailed validation errors for developers
- **User Experience**: Clear messages for end users
- **Monitoring**: Structured logs for error tracking
- **Security**: No sensitive data in error responses

## Database Query Optimization

### Query Pattern
```typescript
const { data: updatedChild, error: updateError } = await supabase
  .from('children')
  .update({ theme_preference: validatedData.theme_preference })
  .eq('id', id)
  .eq('family_id', familyMember.family_id)
  .select('id, name, age_group, theme_preference, profile_photo_url, family_id, created_at')
  .single()
```

### Optimizations
1. **Primary Key Lookup**: `WHERE id = ?` uses primary key index
2. **Family Filter**: `WHERE family_id = ?` uses foreign key index
3. **Single Row**: `.single()` expects one result, fails fast
4. **Explicit Select**: Reduces data transfer, prevents over-fetching
5. **Atomic Operation**: Single database roundtrip

### Performance Characteristics
- **Expected Latency**: 10-50ms database query
- **Index Usage**: Two indexed columns (id, family_id)
- **Data Transfer**: Minimal (7 fields only)
- **Concurrency**: Handles concurrent updates safely

## Next.js 14 Compatibility

### Async Params Pattern
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

#### Why This Matters
- **Next.js 14 Requirement**: Params are now async Promises
- **Breaking Change**: Old sync pattern causes runtime errors
- **Future-Proof**: Aligns with Next.js evolution
- **Type Safety**: TypeScript enforces correct pattern

### Supabase Client Pattern
```typescript
const supabase = await createClient()
```

#### Modernization
- **Old**: `createRouteHandlerClient({ cookies })`
- **New**: `createClient()` from `@/lib/supabase/server`
- **Reason**: Matches current Supabase Auth Helpers patterns
- **Consistency**: Same pattern across all API routes

## Type Safety Strategy

### Exported Types
```typescript
export type ThemeUpdateRequest = z.infer<typeof ThemeUpdateSchema>
```

#### Benefits
1. **Client Integration**: Frontend can import types
2. **API Contract**: Clear interface definition
3. **Refactoring Safety**: Types prevent breaking changes
4. **IDE Support**: Autocomplete and inline documentation

### Schema Reuse
```typescript
// Uses ChildSchema from @/lib/schemas
theme_preference: z.enum(['age-default', 'young', 'older'])
```

#### Benefits
1. **Single Source of Truth**: Schema defined once
2. **Consistency**: Same validation across endpoints
3. **Maintainability**: Update schema in one place
4. **Type Inference**: TypeScript derives types from schema

## Testing Strategy

### Test Coverage Requirements

#### Unit Tests
- Schema validation (valid/invalid themes)
- Error message formatting
- Type exports

#### Integration Tests
- Authentication flow
- Authorization checks (role verification)
- Database operations
- Error responses

#### End-to-End Tests
- Complete request/response cycle
- Cross-family access prevention
- Theme persistence and retrieval

### Test Data
```typescript
const mockChild = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  family_id: '987fcdeb-51a2-43d7-8d9f-123456789abc',
  name: 'Test Child',
  age_group: '5-8',
  theme_preference: 'age-default'
}
```

## Monitoring & Observability

### Logging Strategy
```typescript
console.error('Theme update error:', updateError)
```

#### What to Log
- **Errors**: All caught exceptions with context
- **Security Events**: Unauthorized access attempts
- **Performance**: Slow queries (>500ms)
- **Business Events**: Theme changes for analytics

### Metrics to Track
- **Response Times**: p50, p95, p99 latencies
- **Error Rates**: 4xx vs 5xx breakdown
- **Theme Distribution**: Popular themes by age group
- **Authorization Failures**: Potential security issues

### Alerting Thresholds
- **Error Rate**: >5% over 5 minutes
- **Latency**: p95 >500ms
- **Auth Failures**: >10 per minute from single IP

## API Evolution Strategy

### Version 1.0 (Current)
- Three theme options
- Parent/admin access only
- Family-scoped updates

### Version 2.0 (Potential)
- Custom theme creation
- Per-task theme overrides
- Theme preview without saving
- Child-selected themes (with parental approval)

### Backward Compatibility
- Current schema supports extension
- Enum can be expanded to union types
- Additional fields can be added without breaking changes

## Comparison: Theme Endpoint vs General PATCH

### Theme Endpoint (`/api/children/[id]/theme`)

**Pros**:
- Clear semantic intent
- Focused validation logic
- Easier to track theme-specific analytics
- Independent versioning

**Cons**:
- Additional endpoint to maintain
- Slight code duplication

### General PATCH (`/api/children/[id]`)

**Pros**:
- Single endpoint for all updates
- Fewer API calls for bulk updates
- Consolidated logic

**Cons**:
- Less clear intent
- Mixed analytics
- Harder to apply theme-specific logic

### Recommendation
Use **both** endpoints for different use cases:
- Theme endpoint: Theme-only updates
- General PATCH: Multi-field updates

## Implementation Checklist

- [x] Modernize authentication pattern
- [x] Add role-based authorization
- [x] Implement input validation with Zod
- [x] Add comprehensive error handling
- [x] Support Next.js 14 async params
- [x] Explicit field selection in queries
- [x] Type-safe request/response interfaces
- [x] Detailed error messages
- [x] Security logging
- [x] API documentation
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security audit
- [ ] Rate limiting

## References

### Code Files
- **Endpoint**: `D:/projects/kids-chores-tracker/src/app/api/children/[id]/theme/route.ts`
- **Schemas**: `D:/projects/kids-chores-tracker/src/lib/schemas.ts`
- **Supabase Client**: `D:/projects/kids-chores-tracker/src/lib/supabase/server.ts`

### Documentation
- **API Docs**: `D:/projects/kids-chores-tracker/docs/api/children-theme-endpoint.md`
- **Design Decisions**: This document

### External Resources
- [Next.js 14 Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Zod Validation](https://zod.dev/)
