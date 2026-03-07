# n8n API — Tags

## Overview

Tags help organize workflows and credentials. Tags are global — editing or deleting a tag affects all users on the instance.

## Endpoints

### List Tags

```
GET /api/v1/tags
```

Returns all available tags.

### Create Tag

```
POST /api/v1/tags
```

**Body:**
```json
{
  "name": "production"
}
```

### Update Tag

```
PATCH /api/v1/tags/{id}
```

**Body:**
```json
{
  "name": "new-tag-name"
}
```

### Delete Tag

```
DELETE /api/v1/tags/{id}
```

**Warning:** Deleting a tag removes it from all workflows and affects all users.

## Use Cases

Tags are useful for categorizing workflows:
- `production` / `staging` / `development`
- `payments` / `customer-sync` / `notifications`
- `critical` / `low-priority`
- By team: `marketing` / `engineering` / `sales`

## Example: Create and List Tags

```bash
# Create a tag
curl -X POST "http://localhost:5678/api/v1/tags" \
  -H "X-N8N-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "production"}'

# List all tags
curl -X GET "http://localhost:5678/api/v1/tags" \
  -H "X-N8N-API-KEY: your-api-key"
```

## Tag Object Structure

```json
{
  "id": "1",
  "name": "production",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Permissions

- Instance owners can manage all tags
- Tags are shared across all users on the instance

## Reference

- https://docs.n8n.io/api/api-reference/
