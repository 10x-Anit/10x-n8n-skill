---
description: "List all credentials on the n8n instance"
argument-hint: ""
---

CONTEXT: View stored credentials (metadata only)
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. EXECUTE — `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/credentials"`
3. OUTPUT — table:

| ID | Name | Type | Created |
|----|------|------|---------|

Total: [count] credentials

4. IF empty → suggest `/n8n-credential create <type>`

RULES:
- API never returns secret values — only metadata
- Created column = date only
- Suggest `/n8n-credential create <type>` to add new ones

$ARGUMENTS
