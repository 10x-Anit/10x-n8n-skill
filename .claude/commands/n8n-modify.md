---
description: "Modify a workflow draft safely — changes go to draft only"
argument-hint: "<project-slug> <describe what to change>"
---

CONTEXT: Apply changes to a project's draft workflow using the Python sandbox.
REQUIRES: ~/.claude/n8n-config.json (connected), existing project in projects/<slug>/

## STEPS

1. READ `projects/<slug>/meta.json` and `projects/<slug>/draft/workflow.json`
2. PARSE user's modification request
3. **LOOKUP nodes** — Verify all nodes from source index:
   ```bash
   python sandbox/engine.py find <needed-nodes>
   python sandbox/engine.py search <keyword>    # if unsure about node name
   python sandbox/engine.py detail <node>       # for detailed params from source
   python sandbox/engine.py grep <pattern> <node>  # search source for specific params
   ```
4. CHECK `credentials/cred-map.json` for existing credential IDs
5. IF new credentials needed -> ask user for .env values -> POST `/api/v1/credentials` -> update cred-map.json
6. MODIFY the draft/workflow.json:
   - For adding nodes: create spec, run `engine.py find <node>` for exact type+version
   - For connections: use format from `engine.py rules`
   - Preserve all existing typeVersion values
7. **VALIDATE** — `python sandbox/engine.py validate projects/<slug>/draft/workflow.json`
8. APPEND to history.jsonl

## OUTPUT
```
Modified: "<name>" (draft)
  + Added: <node> | ~ Changed: <node> | - Removed: <node>
  Validation: PASS/FAIL
  Draft saved. NOT pushed to n8n.
Next: /n8n-publish <slug> | /n8n-checkpoint <slug>
```

## RULES
- NEVER modify original/workflow.json
- NEVER push to n8n API — requires explicit /n8n-publish
- NEVER assume typeVersion — always verify via `engine.py find` (backed by n8n source repo)
- Use `engine.py detail/grep` when you need specific parameter formats from source
- Always validate after modification
- When in doubt: verify from source, don't guess

$ARGUMENTS
