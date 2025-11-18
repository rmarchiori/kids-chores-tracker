# Theme API Quick Start Guide

## TL;DR

Update a child's theme preference with a single PATCH request:

```bash
PATCH /api/children/[childId]/theme
{ "theme_preference": "young" }
```

## Quick Reference

### Endpoint
```
PATCH /api/children/{childId}/theme
```

### Request
```json
{
  "theme_preference": "age-default" | "young" | "older"
}
```

### Response
```json
{
  "child": { ... },
  "message": "Theme preference updated successfully"
}
```

## Copy-Paste Examples

### JavaScript/TypeScript Fetch
```typescript
async function updateTheme(childId: string, theme: string) {
  const res = await fetch(`/api/children/${childId}/theme`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme_preference: theme })
  })

  if (!res.ok) throw new Error('Update failed')
  return res.json()
}

// Usage
await updateTheme('child-uuid', 'young')
```

### React Hook
```typescript
import { useState } from 'react'

function useUpdateTheme() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTheme = async (childId: string, theme: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/children/${childId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_preference: theme })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Update failed')
      }

      return await res.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateTheme, loading, error }
}

// Usage in component
function ThemeSelector({ childId }) {
  const { updateTheme, loading, error } = useUpdateTheme()

  const handleChange = async (theme) => {
    try {
      await updateTheme(childId, theme)
      alert('Theme updated!')
    } catch (err) {
      alert(error)
    }
  }

  return (
    <select onChange={(e) => handleChange(e.target.value)} disabled={loading}>
      <option value="age-default">Age Default</option>
      <option value="young">Young Kids Theme</option>
      <option value="older">Older Kids Theme</option>
    </select>
  )
}
```

### Axios
```typescript
import axios from 'axios'

async function updateTheme(childId: string, theme: string) {
  const { data } = await axios.patch(
    `/api/children/${childId}/theme`,
    { theme_preference: theme }
  )
  return data
}
```

### cURL
```bash
# Update to young theme
curl -X PATCH http://localhost:3000/api/children/YOUR-CHILD-ID/theme \
  -H "Content-Type: application/json" \
  -d '{"theme_preference": "young"}'

# Update to older theme
curl -X PATCH http://localhost:3000/api/children/YOUR-CHILD-ID/theme \
  -H "Content-Type: application/json" \
  -d '{"theme_preference": "older"}'

# Reset to age default
curl -X PATCH http://localhost:3000/api/children/YOUR-CHILD-ID/theme \
  -H "Content-Type: application/json" \
  -d '{"theme_preference": "age-default"}'
```

## Theme Values

| Value | Description | Best For |
|-------|-------------|----------|
| `age-default` | Uses child's age_group to determine theme | Most children |
| `young` | Kid-friendly theme: large icons, bright colors | Ages 5-8 or visual learners |
| `older` | More mature theme: compact, sophisticated | Ages 9-12 or advanced users |

## Error Handling

```typescript
try {
  await updateTheme(childId, theme)
  // Success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login'
  } else if (error.response?.status === 403) {
    // Show permission error
    alert('You need parent/admin access')
  } else if (error.response?.status === 404) {
    // Child not found
    alert('Child not found')
  } else {
    // Generic error
    alert('Failed to update theme')
  }
}
```

## TypeScript Types

```typescript
// Request
type ThemePreference = 'age-default' | 'young' | 'older'

interface ThemeUpdateRequest {
  theme_preference: ThemePreference
}

// Response
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

// Error Response
interface ErrorResponse {
  error: string
  message: string
  details?: Array<{
    field: string
    message: string
  }>
}
```

## Common Errors

### 400 Bad Request
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
**Fix**: Check theme value is one of the three valid options

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in"
}
```
**Fix**: Ensure user is authenticated before calling API

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Only parents and admins can update child themes"
}
```
**Fix**: User must have parent or admin role in the family

### 404 Not Found
```json
{
  "error": "Child not found",
  "message": "Child does not exist or does not belong to your family"
}
```
**Fix**: Verify child ID is correct and belongs to user's family

## Security Notes

- **Who Can Update**: Only parents and admins
- **Cross-Family Protection**: Cannot update children from other families
- **Authentication Required**: Must be logged in
- **RLS Enforced**: Database-level security policies active

## Performance Tips

1. **Optimistic Updates**: Update UI immediately, revert on error
   ```typescript
   // Show new theme immediately
   setTheme(newTheme)

   try {
     await updateTheme(childId, newTheme)
   } catch {
     // Revert on error
     setTheme(oldTheme)
   }
   ```

2. **Debouncing**: If using slider/live preview, debounce API calls
   ```typescript
   import { debounce } from 'lodash'

   const debouncedUpdate = debounce(updateTheme, 500)
   ```

3. **Caching**: Cache theme in client state, sync on page load
   ```typescript
   const [theme, setTheme] = useState(child.theme_preference)
   ```

## Testing Checklist

- [ ] Test with valid theme values
- [ ] Test with invalid theme value (should fail)
- [ ] Test without authentication (should 401)
- [ ] Test with child role user (should 403)
- [ ] Test with wrong family's child (should 404)
- [ ] Test with non-existent child ID (should 404)
- [ ] Test successful update and verify response
- [ ] Test theme persists after page refresh

## Alternative: General Update Endpoint

You can also update theme via the general children endpoint:

```typescript
PATCH /api/children/{childId}
{
  "theme_preference": "young",
  "name": "Emma",          // Optional: update multiple fields
  "age_group": "5-8"       // Optional
}
```

Use this when updating multiple child properties at once.

## Need Help?

- **Full API Docs**: See `docs/api/children-theme-endpoint.md`
- **Design Decisions**: See `docs/architecture/theme-api-design-decisions.md`
- **Code**: `src/app/api/children/[id]/theme/route.ts`

## Changelog

### v1.0 (2025-11-18)
- Initial implementation
- Three theme options
- Parent/admin role enforcement
- Comprehensive error handling
