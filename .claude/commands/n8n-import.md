---
description: "Import an existing n8n workflow by ID into a local project"
argument-hint: "<workflow-id>"
---

CONTEXT: Pull an existing workflow from n8n into a local project folder for safe editing.
REQUIRES: ~/.claude/n8n-config.json (connected)

## STEPS

1. READ config from `~/.claude/n8n-config.json` — confirm connected
2. IF no workflow ID provided → GET `/api/v1/workflows` and list for user to pick
3. GET full workflow from `/api/v1/workflows/<id>` — save the raw API response as-is
4. VALIDATE imported workflow:
   - Check that all nodes have a `type` field
   - Check that all nodes have a `typeVersion` field
   - Warn if any node types are not in `docs/nodes/node-catalog.json`
   - List any unknown node types so user is aware
5. CREATE project folder `projects/<slug>/` with: meta.json (status: imported), .env, env.schema.json, original/workflow.json, draft/workflow.json, checkpoints/, credentials/cred-map.json, history.jsonl
6. SAVE API response as original/workflow.json AND draft/workflow.json — store as-is, do NOT transform or modify the JSON structure
7. ANALYZE nodes — detect credential refs → write cred-map.json, env.schema.json, .env template
8. APPEND import action to history.jsonl

## OUTPUT
```
Imported: "<name>"
  ID: <workflow-id> | Nodes: <count> | Active: <yes/no>
  Project: projects/<slug>/
  Detected credentials: <credType> (<node>) [per credential]
  Validation: <PASS / warnings about missing typeVersions or unknown types>
Next: /n8n-modify <slug> <changes> | /n8n-rollback <slug> to restore original
```

## RULES
- NEVER modify the imported workflow JSON — store as-is from API response
- NEVER modify original/workflow.json after creation — it is the rollback baseline
- All edits go to draft/workflow.json only
- Slug is derived from workflow name
- If nodes are missing typeVersion, warn the user but still import

REFERENCE: docs/nodes/node-catalog.json

$ARGUMENTS
