---
description: "Save current draft as a numbered checkpoint"
argument-hint: "<project-slug> [message]"
---

CONTEXT: Snapshot the current draft as a versioned checkpoint for rollback safety.
REQUIRES: Existing project in projects/<slug>/ with a draft

STEPS:
1. READ `projects/<slug>/meta.json` — get current_version
2. READ `projects/<slug>/draft/workflow.json`
3. SET version = current_version + 1
4. WRITE `projects/<slug>/checkpoints/v<N>.json` with: version, message, saved_at timestamp, full workflow JSON
5. UPDATE meta.json: current_version → N, last_checkpoint → timestamp, status → checkpointed
6. APPEND to history.jsonl: `{"action":"checkpoint","msg":"v<N>: <message>","version":<N>}`
7. OUTPUT summary below

OUTPUT:
```
Checkpoint saved: v<N>
  Project: <slug> | Message: <message> | Nodes: <count>
  All checkpoints: v1 — <msg> (<date>) ... v<N> — <msg> (<date>) ← current
Next: /n8n-rollback <slug> <version> to restore any checkpoint
```

RULES:
- Version numbers are strictly sequential — never skip or reuse
- Message defaults to auto-generated summary if user omits it

REFERENCE: projects/<slug>/meta.json, projects/<slug>/draft/workflow.json

$ARGUMENTS
