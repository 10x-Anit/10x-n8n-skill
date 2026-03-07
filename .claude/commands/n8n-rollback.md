---
description: "Restore a checkpoint or original version to draft"
argument-hint: "<project-slug> [version-number|original]"
---

CONTEXT: Revert the draft to a previous checkpoint or the original import.
REQUIRES: Existing project in projects/<slug>/

STEPS:
1. READ `projects/<slug>/meta.json`
2. IF no version specified → LIST all checkpoints with version, message, date, node count → ask user to pick
3. IF version is `0` or `original` → READ `projects/<slug>/original/workflow.json`
4. ELSE → READ `projects/<slug>/checkpoints/v<N>.json` and extract workflow
5. WRITE selected workflow to `projects/<slug>/draft/workflow.json`
6. APPEND to history.jsonl: `{"action":"rollback","msg":"Restored to v<N>","version":<N>}`
7. ASK user: "Push this to n8n now?" → IF yes → run /n8n-publish flow
8. OUTPUT summary below

OUTPUT:
```
Rolled back: "<name>" → v<N>
  Message: <checkpoint message> | Nodes: <count>
  Draft updated. n8n instance unchanged.
Next: /n8n-publish <slug> to push this version to n8n
```

RULES:
- Rollback ONLY changes the local draft — never touches n8n directly
- NEVER modify original/workflow.json
- Version 0/original always refers to original/workflow.json

REFERENCE: projects/<slug>/checkpoints/, projects/<slug>/original/workflow.json

$ARGUMENTS
