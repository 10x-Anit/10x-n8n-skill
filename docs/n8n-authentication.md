# n8n Authentication

## API Key Authentication

The primary method for authenticating with the n8n REST API.

### Generating an API Key

1. Log into your n8n instance (cloud or self-hosted)
2. Navigate to **Settings > n8n API**
3. Click **Create an API Key**
4. Configure:
   - **Label** — Descriptive name for the key
   - **Expiration** — Optional expiry date
   - **Scopes** — Resource-level permissions (Enterprise only)

### Using the API Key

Include in all API requests as a header:

```
X-N8N-API-KEY: n8n_api_xxxxxxxxxxxxx
```

Example:
```bash
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: n8n_api_xxxxxxxxxxxxx"
```

### Key Permissions

| Plan | Scope Control |
|------|--------------|
| Community | Full access to all resources |
| Starter | Full access to all resources |
| Pro | Full access to all resources |
| Enterprise | Configurable scopes per key |

**Note:** Only the instance **owner** can create API keys. Non-enterprise keys have full access to all account resources.

## Enterprise Scopes

Enterprise plans allow restricting API keys to specific resources and actions:

- Limit to specific resource types (workflows only, executions only, etc.)
- Limit to read-only or read-write
- Combine multiple scope restrictions per key

## Authentication Methods in Workflow Nodes

The n8n HTTP Request node supports these authentication types for connecting to external services:

| Method | Description |
|--------|------------|
| API Key (Header) | Send key in request header |
| API Key (Query) | Send key as query parameter |
| Basic Auth | Username + password |
| Bearer Token | Token-based auth |
| OAuth 1.0 | Full OAuth 1.0 flow |
| OAuth 2.0 | Authorization Code, Client Credentials, PKCE |
| Custom Auth | Custom header/body/query auth |

## Security Best Practices

1. **Rotate keys regularly** — Set expiration dates on API keys
2. **Use scopes** — On Enterprise, limit keys to minimum required access
3. **Don't share keys** — Generate separate keys per integration
4. **Use HTTPS** — Always use TLS in production
5. **Store securely** — Never hardcode keys; use environment variables or secret managers

## External Secrets Integration (Enterprise)

Enterprise plans support loading credentials from external secret managers:

- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secrets Manager
- Infisical
- HashiCorp Vault

## Reference

- https://docs.n8n.io/api/authentication/
- https://docs.n8n.io/credentials/
