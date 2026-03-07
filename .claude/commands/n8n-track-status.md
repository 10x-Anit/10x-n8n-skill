---
description: "Show overall tracking state — branch, commits, sync time"
argument-hint: ""
---

CONTEXT: .n8n-track/ HEAD.json, branches.json, commits.jsonl, executions.jsonl
REQUIRES: initialized .n8n-track/

STEPS:
1. VERIFY initialized
2. READ HEAD.json → current branch, last sync, instance, mode
3. COUNT entries in branches.json, commits.jsonl, executions.jsonl
4. CHECK index/ for file count and last rebuild time
5. IF last_sync > 1 hour ago → suggest "Run /n8n-sync"
6. OUTPUT — `Instance | Branch | Last sync | Branches: N | Commits: N | Executions: N | Index: N files`

RULES:
- Show time-ago for last sync (e.g., "15 min ago")
- Include index stats if index exists
- Always show instance URL and mode
