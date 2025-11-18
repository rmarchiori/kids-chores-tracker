# Child Theme Preference API

## Endpoint

```
PATCH /api/children/[id]/theme
```

## Purpose

Updates a child's theme preference for personalized UI experience. Allows parents and admins to customize the visual theme for each child based on their age and preferences.

## Authentication & Authorization

### Authentication
- **Required**: User must be authenticated via Supabase session
- **Method**: `supabase.auth.getUser()`
- **Failure**: Returns 401 Unauthorized

### Authorization Checks (in order)
1. **Family Membership**: User must belong to a family
   - Failure: 404 Family not found
2. **Role Verification**: User must have `parent` or `admin` role
   - Failure: 403 Forbidden
3. **Family Ownership**: Child must belong to user's family
   - Enforced via: `family_id` match + RLS policies
   - Failure: 404 Child not found

## Request

### Path Parameters
- `id` (string, UUID): Child's unique identifier

### Request Body
```typescript
{
  theme_preference: 'age-default' | 'young' | 'older'
}
```

#### Theme Values
- `age-default`: Uses theme based on child's age_group (default)
- `young`: Kid-friendly theme with larger icons, bright colors
- `older`: More mature theme for older children

### Example Request
```bash
curl -X PATCH https://your-domain.com/api/children/123e4567-e89b-12d3-a456-426614174000/theme \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"theme_preference": "young"}'
```

## Response

### Success Response (200 OK)
```json
{
  "child": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Emma",
    "age_group": "5-8",
    "theme_preference": "young",
    "profile_photo_url": "https://example.com/photo.jpg",
    "family_id": "987fcdeb-51a2-43d7-8d9f-123456789abc",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "message": "Theme preference updated successfully"
}
```

### Error Responses

#### 400 Bad Request - Invalid Input
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "theme_preference",
      "message": "Theme must be age-default, young, or older"
    }
  ]
}
```

**Causes**:
- Invalid theme_preference value
- Missing required field
- Invalid JSON format

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in"
}
```

**Causes**:
- No authentication token
- Invalid or expired token
- User session terminated

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Only parents and admins can update child themes"
}
```

**Causes**:
- User role is not `parent` or `admin`
- User is a child or guest in the family

#### 404 Not Found - Family
```json
{
  "error": "Family not found",
  "message": "User is not part of any family"
}
```

**Causes**:
- User has no family_members record
- User was removed from family

#### 404 Not Found - Child
```json
{
  "error": "Child not found",
  "message": "Child does not exist or does not belong to your family"
}
```

**Causes**:
- Child ID does not exist
- Child belongs to different family
- Child was deleted
- RLS policy blocked access

#### 500 Internal Server Error - Update Failed
```json
{
  "error": "Update failed",
  "message": "Database error message"
}
```

**Causes**:
- Database connection issues
- Constraint violation
- Unexpected database error

#### 500 Internal Server Error - Generic
```json
{
  "error": "Internal server error",
  "message": "Failed to update theme preference"
}
```

**Causes**:
- Unexpected application error
- Unhandled exception

## Security Features

### Defense in Depth
1. **Authentication Layer**: Verifies user identity
2. **Role-Based Access**: Checks user role (parent/admin)
3. **Family Boundary**: Ensures family_id match
4. **Row-Level Security**: Database enforces access policies
5. **Input Validation**: Zod schema prevents invalid data

### Data Integrity
- **Type Safety**: TypeScript + Zod validation
- **Enum Constraint**: Only valid theme values accepted
- **Atomic Updates**: Single database transaction
- **Explicit Select**: Returns only necessary fields

### Error Handling
- **Specific Error Codes**: Differentiates error types
- **Secure Messages**: No sensitive data in error responses
- **Detailed Logging**: console.error for debugging
- **User-Friendly Messages**: Clear error descriptions

## Database Impact

### Tables Modified
- `children`: Updates `theme_preference` column

### Query Performance
- **Primary Key Lookup**: `WHERE id = ?` (indexed)
- **Family Filter**: `WHERE family_id = ?` (indexed)
- **Single Row**: Uses `.single()` for one record

### RLS Policies Applied
- Policy ensures user can only access children in their family
- Enforced at database level for additional security

## Integration Examples

### React/Next.js Client
```typescript
async function updateChildTheme(childId: string, theme: ThemePreference) {
  const response = await fetch(`/api/children/${childId}/theme`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme_preference: theme }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update theme')
  }

  return response.json()
}
```

### TypeScript Types
```typescript
type ThemePreference = 'age-default' | 'young' | 'older'

interface ThemeUpdateRequest {
  theme_preference: ThemePreference
}

interface ThemeUpdateResponse {
  child: {
    id: string
    name: string
    age_group: '5-8' | '9-12'
    theme_preference: ThemePreference
    profile_photo_url: string | null
    family_id: string
    created_at: string
  }
  message: string
}
```

### Error Handling
```typescript
try {
  const result = await updateChildTheme(childId, 'young')
  console.log('Theme updated:', result.message)
} catch (error) {
  if (error.response?.status === 403) {
    // Handle permission error
    alert('You do not have permission to change themes')
  } else if (error.response?.status === 404) {
    // Handle not found
    alert('Child not found')
  } else {
    // Handle other errors
    alert('Failed to update theme')
  }
}
```

## Testing

### Test Cases

#### Happy Path
```bash
# Test successful update
curl -X PATCH /api/children/{valid-id}/theme \
  -H "Authorization: Bearer {parent-token}" \
  -d '{"theme_preference": "young"}'
# Expected: 200 OK with updated child
```

#### Validation Tests
```bash
# Test invalid theme value
curl -X PATCH /api/children/{id}/theme \
  -d '{"theme_preference": "invalid"}'
# Expected: 400 Bad Request

# Test missing field
curl -X PATCH /api/children/{id}/theme \
  -d '{}'
# Expected: 400 Bad Request
```

#### Authorization Tests
```bash
# Test without authentication
curl -X PATCH /api/children/{id}/theme \
  -d '{"theme_preference": "young"}'
# Expected: 401 Unauthorized

# Test with non-parent role
curl -X PATCH /api/children/{id}/theme \
  -H "Authorization: Bearer {child-token}" \
  -d '{"theme_preference": "young"}'
# Expected: 403 Forbidden

# Test cross-family access
curl -X PATCH /api/children/{other-family-child-id}/theme \
  -H "Authorization: Bearer {parent-token}" \
  -d '{"theme_preference": "young"}'
# Expected: 404 Not Found
```

## Alternative: Using Existing PATCH Endpoint

The theme can also be updated via the general children endpoint:

```bash
PATCH /api/children/[id]
{
  "theme_preference": "young"
}
```

### When to Use Which Endpoint

**Use `/api/children/[id]/theme`**:
- Dedicated theme updates only
- Clearer API semantics
- Easier to track theme-specific changes
- Better for UI components focused on theme selection

**Use `/api/children/[id]`**:
- Updating multiple child fields at once
- Bulk updates (name + age + theme)
- General child management interfaces

## Performance Considerations

### Response Time
- **Typical**: 50-150ms
- **Factors**: Database latency, RLS policy complexity
- **Optimization**: Single query with indexed fields

### Rate Limiting
- Recommended: 100 requests per minute per user
- Implement at API gateway or middleware level

### Caching Strategy
- **Not Recommended**: Theme preferences change frequently
- **If Implemented**: Short TTL (60 seconds), invalidate on update

## Version History

### Version 1.0 (Current)
- Initial implementation
- Support for three theme values
- Parent/admin role-based access
- Family boundary enforcement
- Comprehensive error handling

### Future Enhancements
- Custom theme creation
- Per-task theme overrides
- Theme preview without saving
- Theme analytics and recommendations
