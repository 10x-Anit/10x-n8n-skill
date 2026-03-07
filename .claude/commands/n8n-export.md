---
description: "Export a workflow as JSON file"
argument-hint: "<workflow-id> [output-path]"
---

CONTEXT: Download workflow definition and save locally
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

## STEPS

1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. IF no ID → list workflows: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows"`
3. GET workflow: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows/$id"`
4. SAVE the raw API response directly — do NOT transform, restructure, or strip any fields
5. IF no output-path → default to `./n8n-workflow-$id-$slugifiedName.json`
6. SAVE response as pretty-printed JSON to output path
7. IF JSON contains httpHeaderAuth or credential data → warn: "Export may contain auth headers. Review before sharing."

## OUTPUT
```
Exported "$name" (ID: $id) → $path | Nodes: $count | Active: $active
```

## RULES
- Always pretty-print the JSON output
- Save the raw API response — do not remove or add fields
- Warn about embedded credentials/auth headers
- Default filename includes workflow ID and slugified name

$ARGUMENTS
