# n8n REST API — Overview

## Base URL

All API endpoints are prefixed with `/api/v1`.

- **Self-hosted:** `http://localhost:5678/api/v1` (or your custom host/port)
- **Cloud:** `https://<your-instance>.app.n8n.cloud/api/v1`

## Authentication

All requests require the header:

```
X-N8N-API-KEY: <your-api-key>
```

API keys are generated at: **Settings > n8n API > Create an API Key**

## API Playground

Available at `/api/v1/docs` on any n8n instance. Swagger/Scalar-based interactive interface that uses real data for testing.

## Rate Limits

- **Default:** 60 requests per minute per user
- **Recommendation:** Batch size of 20 with 5-minute intervals stays well below limits
- **Self-hosted:** Configurable, no hard limits
- **Cloud:** Additional concurrency and memory caps based on plan

## API Resources

The n8n Public API provides operations across these resources:

| Resource | Operations |
|----------|-----------|
| Workflows | CRUD, activate, deactivate, list, share |
| Executions | Get, list, stop, delete, filter by status |
| Credentials | Create, delete, update, list, get schema |
| Tags | CRUD |
| Variables | CRUD (Pro+ plans only) |
| Users | CRUD (Enterprise only) |
| Projects | Management (Pro+ plans) |
| Webhooks | Test/Production URLs |

## Response Format

All responses are JSON. Successful operations return the resource object. List operations support pagination with `limit` and `cursor` parameters.

## Error Handling

Standard HTTP status codes:
- `200` — Success
- `201` — Created
- `400` — Bad request
- `401` — Unauthorized (invalid/missing API key)
- `403` — Forbidden (insufficient permissions)
- `404` — Resource not found
- `429` — Rate limit exceeded

## Official Documentation

- API Docs: https://docs.n8n.io/api/
- API Reference: https://docs.n8n.io/api/api-reference/
- Authentication: https://docs.n8n.io/api/authentication/
- API Playground: https://docs.n8n.io/api/using-api-playground/
