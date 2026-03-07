---
description: "Pull latest workflows and executions from n8n API"
argument-hint: "[--workflows-only | --executions-only]"
---

CONTEXT: .n8n-track/ refs, snapshots, commits
REQUIRES: initialized .n8n-track/ (run /n8n-init first)

STEPS:
1. VERIFY HEAD.json has initialized:true
2. GET /api/v1/workflows → for each, compare hash against local ref
3. IF hash differs → save snapshot, compute diff, update ref, append commit
4. IF hash matches → skip
5. DETECT deleted workflows (local ref with no remote match)
6. GET /api/v1/executions?limit=50 → append new entries to executions.jsonl
7. UPDATE HEAD.json last_sync timestamp
8. OUTPUT — `New: N | Changed: N | Unchanged: N | Deleted: N | Executions: N`

RULES:
- Commit msg format: `sync: +<added> -<removed> ~<modified> nodes`
- Save diffs to diffs/<id>/<oldHash>..<newHash>.json
- Always update last_sync even if nothing changed
