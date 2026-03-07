---
description: "Switch tracking context to a workflow branch"
argument-hint: "<branch-name | workflow-id>"
---

CONTEXT: .n8n-track/HEAD.json + branches.json
REQUIRES: initialized .n8n-track/, branch must exist

STEPS:
1. VERIFY initialized
2. PARSE arg — accept `workflow-42`, `42`, or `main`
3. IF branch not in branches.json → error "Branch not found. Run /n8n-branch"
4. UPDATE HEAD.json current_branch to target branch
5. LOAD latest ref from refs/workflows/<id>.json
6. OUTPUT — `Switched to workflow-<id>: <name> | Active: y/n | Nodes: N | Last commit: <hash> <msg>`

RULES:
- Sets default workflow context for /n8n-diff, /n8n-log, /n8n-commit
- Accept bare ID (auto-expand to workflow-<id>)
- Always show workflow summary after switch
