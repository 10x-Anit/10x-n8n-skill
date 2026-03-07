---
description: "CRUD a single n8n workflow (get/create/update/delete/activate/deactivate)"
argument-hint: "<action> [id|json]"
---

CONTEXT: Manage one workflow by ID
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. PARSE action from args: get, create, update, delete, activate, deactivate
3. IF get → `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows/$id"`
4. IF create → `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/workflows" -d '{"name":"$name","nodes":[],"connections":{},"settings":{}}'`
5. IF update → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/workflows/$id" -d '$fieldsJson'`
6. IF delete → confirm first → `curl -s -X DELETE -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows/$id"`
7. IF activate → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/workflows/$id" -d '{"active":true}'`
8. IF deactivate → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/workflows/$id" -d '{"active":false}'`
9. OUTPUT — confirm action with workflow name, ID, status

RULES:
- Created workflows start inactive
- Delete permanently removes workflow AND execution history — warn user
- Update asks user what fields to change before sending

$ARGUMENTS
