---
description: "Create, update, or delete a credential"
argument-hint: "<create|update|delete> <type-or-id>"
---

CONTEXT: Manage one credential by type or ID
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. PARSE action from args: create, update, delete
3. IF create → fetch schema: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/credentials/schema/$type"`
4. IF create → show required fields from schema, ask user for values
5. IF create → `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/credentials" -d '{"name":"$name","type":"$type","data":{$fields}}'`
6. IF update → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/credentials/$id" -d '$fieldsJson'`
7. IF delete → `curl -s -X DELETE -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/credentials/$id"`
8. OUTPUT — confirm action with credential name/ID

RULES:
- Common types: slackApi, githubApi, httpBasicAuth, httpHeaderAuth, openAiApi
- Credential values are stored encrypted — API never returns secrets
- Always fetch schema before create to show required fields

$ARGUMENTS
