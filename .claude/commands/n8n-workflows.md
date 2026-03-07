---
description: "List n8n workflows with optional active/inactive filter"
argument-hint: "[active|inactive|all]"
---

CONTEXT: List workflows on connected n8n instance
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. IF arg = "active" → append `?active=true` to URL
3. IF arg = "inactive" → append `?active=false` to URL
4. EXECUTE — `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows"`
5. OUTPUT — table:

| ID | Name | Active | Tags | Updated |
|----|------|--------|------|---------|

Total: [count] workflows

6. IF empty → suggest `/n8n-workflow create`

RULES:
- Default (no args) returns all workflows
- Tags column = comma-separated tag names
- Updated column = date only (no time)

$ARGUMENTS
