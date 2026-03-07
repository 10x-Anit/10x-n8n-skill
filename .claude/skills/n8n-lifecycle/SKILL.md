---
description: "Workflow lifecycle — create/import → modify → test → checkpoint → publish in one flow"
argument-hint: "<slug> [create <desc>|import <id>|modify <changes>|test|publish]"
allowed-tools: "Read, Write, Bash(curl *), Grep, Glob"
---

CONTEXT: Manage the full lifecycle of a single workflow project. Chains: /n8n-new OR /n8n-import → /n8n-modify → /n8n-execute → /n8n-checkpoint → /n8n-publish.

REQUIRES: ~/.claude/n8n-config.json

STEPS:
1. READ config — confirm connected
2. PARSE $ARGUMENTS → determine action: create, import, modify, test, publish, or full-cycle

### IF `create <desc>`:
3. RUN /n8n-new logic: parse NL → consult catalog → create project → build JSON → deploy
4. OUTPUT: project created at projects/<slug>/

### IF `import <id>`:
5. RUN /n8n-import logic: GET workflow → create project → save original + draft → detect creds
6. OUTPUT: project imported at projects/<slug>/

### IF `modify <changes>`:
7. READ projects/<slug>/draft/workflow.json
8. RUN /n8n-modify logic: consult catalog → apply changes to draft → log
9. OUTPUT: draft updated

### IF `test`:
10. READ projects/<slug>/meta.json for workflow_id
11. POST `<baseUrl>/api/v1/workflows/<id>/run`
12. CAPTURE execution result
13. IF success → suggest: `/n8n-lifecycle <slug> publish`
14. IF fail → show error, suggest: `/n8n-lifecycle <slug> modify <fix>`

### IF `publish`:
15. AUTO-CHECKPOINT draft as v<N>
16. VERIFY credentials in n8n
17. PATCH or POST workflow to API
18. UPDATE original + meta
19. OUTPUT: published

### IF no specific action (full-cycle):
20. GUIDE user through: create/import → modify → test → checkpoint → publish
21. ASK at each gate: proceed, modify more, or stop

OUTPUT per action:
```
[<ACTION>] <slug>: <result summary>
Lifecycle: create → modify → test → checkpoint → publish
Current stage: <stage>
Next: <suggested next action>
```

RULES:
- Original never modified — all changes in draft
- Auto-checkpoint before every publish
- Test execution before publishing (warn if skipped)
- Each action is independently re-runnable

$ARGUMENTS
