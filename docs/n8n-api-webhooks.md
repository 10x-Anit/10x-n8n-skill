# n8n API — Webhooks

## Overview

Webhooks are a core trigger mechanism in n8n. They allow external services to trigger workflow executions via HTTP requests. n8n provides two types of webhook URLs for each webhook node.

## Webhook URL Types

### Test URL
- Registered when you click "Listen for Test Event" or execute the workflow manually
- Only triggers the webhook node (not the full workflow)
- Used for capturing sample payloads during development
- Format: `{BASE_URL}/webhook-test/{path}`

### Production URL
- Registered when the workflow is **activated** (published)
- Runs the full workflow from start to finish
- Format: `{BASE_URL}/webhook/{path}`

## Supported HTTP Methods

Webhook nodes support:
- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `HEAD`

**Constraint:** Only one webhook per path + method combination is allowed. If a conflict exists, you must unpublish the conflicting workflow.

## Configuration Options

### CORS (Cross-Origin Resource Sharing)
- Set allowed origins as comma-separated domains
- Use `*` to allow all origins (default)
- Example: `https://app.example.com,https://admin.example.com`

### Binary Data
- Enable to receive binary data (files, images)
- Specify a property name for the binary data

### IP Whitelist
- Restrict webhook invocations to specific IP addresses
- Comma-separated list of allowed IPs

### Response Configuration
- **Immediately** — Respond as soon as webhook is received
- **When last node finishes** — Respond after workflow completes
- **Using Respond to Webhook node** — Custom response at any point in workflow

## Webhook URL Behind Reverse Proxy

When running n8n behind a reverse proxy (Nginx, Traefik), set the `WEBHOOK_URL` environment variable:

```bash
WEBHOOK_URL=https://n8n.yourdomain.com
```

This ensures webhook URLs display correctly and external services can reach them.

## Example: Webhook Trigger Workflow

A webhook-triggered workflow structure:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "my-webhook",
        "responseMode": "onReceived",
        "options": {}
      },
      "typeVersion": 2,
      "position": [250, 300]
    }
  ]
}
```

## Testing Webhooks

```bash
# Trigger a production webhook
curl -X POST "http://localhost:5678/webhook/my-webhook" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Trigger a test webhook
curl -X POST "http://localhost:5678/webhook-test/my-webhook" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## MCP Tool Integration

- Workflows can be exposed as MCP (Model Context Protocol) tools
- Self-hosted: No restrictions on trigger type
- Cloud Starter: Requires specific Webhook trigger type for MCP

## Reference

- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
