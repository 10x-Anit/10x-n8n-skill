# n8n API — Executions

## Overview

Executions represent individual runs of a workflow. The API allows retrieving, listing, stopping, and deleting execution records.

## Endpoints

### Get Execution

```
GET /api/v1/executions/{id}
```

Returns detailed execution data including status, start/end timestamps, and result data.

**Query Parameters:**
- `includeData` (boolean) — Whether to include full execution data (input/output of each node)

### List Executions

```
GET /api/v1/executions
```

**Query Parameters:**
- `workflowId` (string) — Filter by specific workflow
- `status` (string) — Filter by status: `success`, `error`, `waiting`, `running`
- `limit` (number) — Max results (max 250 per request)
- `cursor` (string) — Pagination cursor
- `includeData` (boolean) — Include full execution data

**Note:** Executions with "waiting" status may not appear in results (known issue).

### Stop Execution

```
POST /api/v1/executions/{id}/stop
```

Stops a currently running execution.

### Delete Executions

```
DELETE /api/v1/executions
```

**Query Parameters:**
- `ids` (array) — Specific execution IDs to delete
- `workflowId` (string) — Delete all executions for a workflow

## Execution Status Values

| Status | Description |
|--------|-------------|
| `success` | Workflow completed successfully |
| `error` | Workflow failed with an error |
| `running` | Workflow is currently executing |
| `waiting` | Workflow is paused/waiting (e.g., Wait node) |

## Example: List Failed Executions

```bash
curl -X GET "http://localhost:5678/api/v1/executions?status=error&limit=10" \
  -H "X-N8N-API-KEY: your-api-key"
```

## Example: Stop a Running Execution

```bash
curl -X POST "http://localhost:5678/api/v1/executions/123/stop" \
  -H "X-N8N-API-KEY: your-api-key"
```

## Execution Data Structure

```json
{
  "id": "123",
  "finished": true,
  "mode": "manual",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "stoppedAt": "2024-01-15T10:30:05.000Z",
  "workflowId": "1",
  "status": "success",
  "data": {
    "resultData": {
      "runData": {}
    }
  }
}
```

## Rate Limits

- Max 250 executions per list request
- Default 60 API requests per minute per user
- Cloud plans have additional execution runtime limits

## Reference

- https://docs.n8n.io/api/api-reference/
- https://docs.n8n.io/workflows/executions/
