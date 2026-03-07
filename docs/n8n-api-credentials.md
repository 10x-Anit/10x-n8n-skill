# n8n API — Credentials

## Overview

Credentials store authentication data for third-party services used in workflow nodes. The API allows creating, listing, updating, and deleting credentials. All credential data is stored encrypted in the database.

## Endpoints

### List Credentials

```
GET /api/v1/credentials
```

Returns a list of all credentials accessible to the API key owner. Does NOT return the actual secret values.

### Get Credential Schema

```
GET /api/v1/credentials/schema/{credentialTypeName}
```

Retrieves the schema for a specific credential type, showing required fields and their types. **Use this before creating credentials** to understand what data is needed.

**Example credential type names:** `slackApi`, `githubApi`, `googleSheetsOAuth2Api`, `httpBasicAuth`

### Create Credential

```
POST /api/v1/credentials
```

**Body:**
```json
{
  "name": "My Slack Credential",
  "type": "slackApi",
  "data": {
    "accessToken": "xoxb-your-token"
  }
}
```

Returns the created credential with its ID (used in workflow node references).

### Update Credential

```
PATCH /api/v1/credentials/{id}
```

**Body:** Partial credential object. Supports `isPartialData: true` for merging partial data instead of full replacement.

### Delete Credential

```
DELETE /api/v1/credentials/{id}
```

Permanently removes the credential.

## Security Notes

- Credentials are stored **encrypted** in the database
- The API never returns actual secret values in list/get responses
- Shared credentials allow users to execute workflows without viewing credential values
- Enterprise users can use external secrets: AWS Secrets Manager, Azure Key Vault, GCP Secrets Manager, Infisical, HashiCorp Vault

## Example: Get Schema Then Create

```bash
# Step 1: Get the schema for Slack API credentials
curl -X GET "http://localhost:5678/api/v1/credentials/schema/slackApi" \
  -H "X-N8N-API-KEY: your-api-key"

# Step 2: Create the credential with required fields
curl -X POST "http://localhost:5678/api/v1/credentials" \
  -H "X-N8N-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack Bot Token",
    "type": "slackApi",
    "data": {
      "accessToken": "xoxb-your-bot-token"
    }
  }'
```

## Credential Object Structure

```json
{
  "id": "1",
  "name": "My Credential",
  "type": "slackApi",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Reference

- https://docs.n8n.io/api/api-reference/
- https://docs.n8n.io/credentials/
