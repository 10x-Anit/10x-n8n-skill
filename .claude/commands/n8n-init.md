---
description: "Initialize .n8n-track/ directory and perform first sync"
argument-hint: ""
---

CONTEXT: .n8n-track/ directory structure
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect first)

STEPS:
1. IF no n8n-config.json → error "Run /n8n-connect first"
2. IF HEAD.json has initialized:true → warn "Already initialized. Run /n8n-sync"
3. CREATE HEAD.json with current_branch:main, initialized:true, instance, mode
4. GET /api/v1/workflows → for each: save snapshot, create ref, add branch, append commit
5. GET /api/v1/executions?limit=50 → append each to executions.jsonl
6. RUN indexer on docs/ + snapshots/ → write context-map.json + line-index.json
7. OUTPUT — `Workflows synced: N | Executions logged: N | Index: N files`

RULES:
- One commit per workflow on init with parent:null
- Branch format: workflow-<id>
- Commit msg format: `init: <name> (<N> nodes)`
