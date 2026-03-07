---
description: "List, create, update, or delete instance variables (Pro+ plans)"
argument-hint: "[create|update|delete] [key] [value]"
---

CONTEXT: Manage shared variables accessible via {{ $vars.KEY }}
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. IF no action → list: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/variables"`
3. IF create → `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/variables" -d '{"key":"$key","value":"$value"}'`
4. IF update → `curl -s -X PATCH -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/variables/$id" -d '{"value":"$newValue"}'`
5. IF delete → `curl -s -X DELETE -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/variables/$id"`
6. OUTPUT list → table: | ID | Key | Value |
7. OUTPUT create/update/delete → confirm with variable key/ID

RULES:
- Pro and Enterprise plans only — if 403, tell user plan upgrade needed
- No args = list all variables
- Variables are referenced in workflows as {{ $vars.KEY }}

$ARGUMENTS
