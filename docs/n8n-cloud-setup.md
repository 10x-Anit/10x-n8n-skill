# n8n Cloud Setup

## Overview

n8n Cloud is a managed hosting solution where n8n handles infrastructure, updates, and security. You sign up, get an instance, and start building workflows.

## Getting Started

### Step 1: Create Account

1. Go to [n8n.io](https://n8n.io)
2. Sign up for a cloud account
3. Choose your plan (Free, Starter, Pro, or Enterprise)

### Step 2: Access Your Instance

Your n8n cloud instance URL format:
```
https://<your-instance-name>.app.n8n.cloud
```

### Step 3: Generate API Key

1. Log into your cloud instance
2. Go to **Settings** (gear icon in sidebar)
3. Navigate to **n8n API**
4. Click **Create an API Key**
5. Set a label (e.g., "Claude Code Integration")
6. Optionally set an expiration date
7. Copy the generated key — it won't be shown again

### Step 4: Test API Access

```bash
curl -X GET "https://<your-instance>.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key-here"
```

If successful, you'll get a JSON response with your workflows.

## Connection Details for the Skill

To connect the n8n skill to your cloud instance, you need:

| Field | Value |
|-------|-------|
| **Mode** | `cloud` |
| **Base URL** | `https://<your-instance>.app.n8n.cloud` |
| **API Key** | The key generated in Step 3 |

## Cloud Plans & API Access

| Plan | API Access | Price |
|------|-----------|-------|
| Free | No API | Free |
| Starter | Yes | Starting price |
| Pro | Yes + Variables, Projects | Higher tier |
| Enterprise | Yes + Full RBAC, Scopes | Custom pricing |

**Important:** The free cloud plan does NOT include API access. You need at least the Starter plan.

## Cloud Instance Management

### What n8n Manages
- Server infrastructure and uptime
- Database (PostgreSQL)
- SSL/TLS certificates
- Automatic updates to latest n8n version
- Backups and data recovery
- Security patches

### What You Manage
- Workflows and their logic
- Credentials for third-party services
- API keys and access
- User management (if on team plan)
- Workflow organization (tags, projects)

## Rate Limits

- **API:** 60 requests per minute per user
- **Executions:** Concurrent limits based on plan
- **Webhooks:** Subject to plan-based limits

## Webhook URLs on Cloud

Production webhooks follow this pattern:
```
https://<your-instance>.app.n8n.cloud/webhook/<your-path>
```

Test webhooks:
```
https://<your-instance>.app.n8n.cloud/webhook-test/<your-path>
```

## Troubleshooting

### API Key Not Working
- Verify you're on a paid plan (Starter or above)
- Check the key hasn't expired
- Ensure the header name is exactly `X-N8N-API-KEY`
- Verify the instance URL is correct

### Cannot Find API Settings
- Only the instance **owner** can create API keys
- Free plan users won't see the API section

### Rate Limit Errors (429)
- Reduce request frequency to under 60/min
- Implement backoff/retry logic
- Batch operations where possible

## Reference

- https://docs.n8n.io/api/authentication/
- https://n8n.io/pricing/
