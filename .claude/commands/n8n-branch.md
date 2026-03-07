---
description: "List tracked workflow branches or create a new one"
argument-hint: "[create <name>] [--list]"
---

CONTEXT: .n8n-track/branches.json + HEAD.json
REQUIRES: initialized .n8n-track/

STEPS:
1. VERIFY initialized
2. IF no args or --list → READ branches.json, display all branches
3. MARK current branch from HEAD.json with `*`
4. IF `create <name>` → POST /api/v1/workflows with empty workflow
5. ADD new branch to branches.json, save initial snapshot, append init commit
6. OUTPUT list: `* branch-name | workflow-name [active/inactive] (N nodes, N commits)`

RULES:
- Branch naming: workflow-<id>
- `main` branch always exists (instance state)
- Init commit msg: `init: <name> (0 nodes)`
