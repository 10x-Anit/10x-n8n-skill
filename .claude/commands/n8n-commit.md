---
description: "Snapshot current workflow state with a commit message"
argument-hint: "<workflow-id> <message>"
---

CONTEXT: .n8n-track/ snapshots, commits, refs
REQUIRES: initialized .n8n-track/, valid workflow-id

STEPS:
1. VERIFY initialized, parse <workflow-id> and <message>
2. GET /api/v1/workflows/<id> → fetch current state
3. SAVE snapshot to snapshots/<id>/<hash>.json
4. IF previous commit exists → load old snapshot, compute diff, save to diffs/
5. UPDATE ref in refs/workflows/<id>.json
6. APPEND to commits.jsonl: hash, timestamp, workflow-id, branch, message, parent
7. OUTPUT — `[workflow-<id> <hash>] <message>` + diff summary

RULES:
- Hash computed from full workflow JSON
- Parent points to previous commit hash (null if first)
- One commit per invocation
