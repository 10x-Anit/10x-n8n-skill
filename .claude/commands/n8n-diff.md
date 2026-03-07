---
description: "Show node-level changes between two workflow snapshots"
argument-hint: "<workflow-id> [old-hash] [new-hash]"
---

CONTEXT: .n8n-track/ snapshots, diffs, commits
REQUIRES: initialized .n8n-track/, at least one commit for workflow

STEPS:
1. VERIFY initialized, parse workflow-id
2. IF no hashes → compare last two commits from commits.jsonl
3. IF one commit only → show full snapshot as initial state
4. CHECK diffs/<id>/<old>..<new>.json for cached diff
5. IF no cache → load both snapshots, compute diff
6. OUTPUT — `Nodes added: +N | Removed: -N | Modified: ~N | Connections: changed/unchanged`

RULES:
- Show node type and name for each added/removed/modified node
- For modified nodes, note what changed (parameters, credentials, etc.)
- If no changes → "No changes between <old> and <new>"
