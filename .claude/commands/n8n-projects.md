---
description: "List all local workflow projects with status"
argument-hint: "[project-slug]"
---

CONTEXT: Overview of all local n8n projects or detailed view of one.
REQUIRES: projects/ directory

STEPS:
1. IF no argument → SCAN `projects/` directory → read each meta.json
2. OUTPUT table: Slug, Name, Status, Version, Nodes, Workflow ID
3. IF <project-slug> provided → READ that project's meta.json, history.jsonl, cred-map.json, checkpoints/
4. OUTPUT full detail: name, slug, ID, status, active, nodes, version, dates, checkpoints list, credentials, env var status, recent history

OUTPUT (list):
```
Slug                 Name                   Status       Version  Nodes  ID
<slug>               <name>                 <status>     v<N>     <n>    <id>
Total: <count> projects
```

OUTPUT (detail):
```
Project: <name>
  Slug: <slug> | ID: <workflow-id> | Status: <status> | Version: v<N>
  Nodes: <count> | Active: <yes/no>
  Checkpoints: v1 — <msg> (<date>) ... v<N> — <msg> (<date>) ← current
  Credentials: <credType> → ID: <id> (<env_var>: SET/MISSING) [per cred]
  Recent history: <last 5 entries>
Actions: /n8n-modify, /n8n-checkpoint, /n8n-publish, /n8n-rollback
```

RULES:
- Always read meta.json for each project — never guess status
- Show "—" for missing workflow IDs (not yet published)

REFERENCE: projects/*/meta.json

$ARGUMENTS
