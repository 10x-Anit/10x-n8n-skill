---
description: "List, create, update, or delete tags"
argument-hint: "[create|update|delete] [name-or-id]"
---

CONTEXT: Manage workflow tags
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. IF no action → list: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/tags"`
3. IF create → `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/tags" -d '{"name":"$name"}'`
4. IF update → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/tags/$id" -d '{"name":"$newName"}'`
5. IF delete → `curl -s -X DELETE -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/tags/$id"`
6. OUTPUT list → table: | ID | Name | Created |
7. OUTPUT create/update/delete → confirm with tag name/ID

RULES:
- No args = list all tags
- Delete removes tag from ALL workflows instance-wide — warn user
- Update requires both ID and new name

$ARGUMENTS
