---
description: "Push draft to n8n — auto-checkpoints first, then updates via API"
argument-hint: "<project-slug>"
---

CONTEXT: Deploy the current draft to the live n8n instance.
REQUIRES: ~/.claude/n8n-config.json (connected), existing project with draft

STEPS:
1. READ `projects/<slug>/meta.json` and `projects/<slug>/draft/workflow.json`
2. AUTO-CHECKPOINT — save draft as v<N> before pushing (run /n8n-checkpoint logic)
3. VERIFY credentials — read cred-map.json → GET `/api/v1/credentials` → confirm all exist
4. IF missing credentials → WARN user and offer to recreate from .env
5. IF workflow_id exists in meta → PATCH `/api/v1/workflows/<id>` with draft JSON
6. IF no workflow_id → POST `/api/v1/workflows` with draft JSON
7. ON SUCCESS → copy published version to original/workflow.json → update meta.json (last_published, status: published, workflow_id) → append to history.jsonl
8. ON FAILURE → keep draft as-is, do NOT update original → show API error
9. ASK user if they want to activate the workflow now
10. OUTPUT summary below

OUTPUT:
```
Published: "<name>"
  ID: <workflow-id> | Checkpoint: v<N> saved | Nodes: <count>
  Status: inactive (activate with /n8n-workflow activate <id>)
  Original baseline updated to match published version.
Next: /n8n-rollback <slug> restores to this published state
```

RULES:
- ALWAYS auto-checkpoint before pushing — no exceptions
- ON FAILURE never update original/workflow.json
- Credential verification is mandatory before push

REFERENCE: projects/<slug>/credentials/cred-map.json

$ARGUMENTS
