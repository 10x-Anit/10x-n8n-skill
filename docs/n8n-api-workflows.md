# n8n API — Workflows

## Overview

Workflows are the core resource in n8n. The API allows full CRUD operations plus activation control.

## Endpoints

### List Workflows

```
GET /api/v1/workflows
```

**Query Parameters:**
- `active` (boolean) — Filter by active/inactive status
- `limit` (number) — Max results to return
- `cursor` (string) — Pagination cursor
- `tags` (string) — Filter by tag name

**Response:** Array of workflow objects with id, name, active status, nodes, connections, settings.

### Get Single Workflow

```
GET /api/v1/workflows/{id}
```

Returns complete workflow JSON including all nodes, connections, and settings.

### Create Workflow

```
POST /api/v1/workflows
```

**Body:** Workflow JSON object with name, nodes, connections, settings.

**Important:** Workflows are always created in **inactive** state regardless of what you pass. You must activate separately.

### Update Workflow

```
PATCH /api/v1/workflows/{id}
```

**Body:** Partial workflow object with fields to update.

**Note:** The API prevents credential tampering during updates.

### Delete Workflow

```
DELETE /api/v1/workflows/{id}
```

**Warning:** Permanently deletes the workflow AND all its execution history. This cannot be undone.

### Activate Workflow

```
PATCH /api/v1/workflows/{id}
```

**Body:**
```json
{
  "active": true
}
```

### Deactivate Workflow

```
PATCH /api/v1/workflows/{id}
```

**Body:**
```json
{
  "active": false
}
```

### Share Workflow (Enterprise)

Control workflow sharing and access permissions at the project level.

## Example: List All Active Workflows

```bash
curl -X GET "http://localhost:5678/api/v1/workflows?active=true" \
  -H "X-N8N-API-KEY: your-api-key"
```

## Example: Create a Workflow

```bash
curl -X POST "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Workflow",
    "nodes": [],
    "connections": {},
    "settings": {}
  }'
```

## Workflow JSON Structure

```json
{
  "id": "1",
  "name": "My Workflow",
  "active": false,
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [250, 300]
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  },
  "tags": []
}
```

## Reference

- https://docs.n8n.io/api/api-reference/
- https://docs.n8n.io/workflows/
