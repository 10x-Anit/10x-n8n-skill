---
description: "First-time setup — install n8n, connect, initialize tracking, create first workflow"
argument-hint: "[cloud|self-hosted]"
allowed-tools: "Read, Write, Bash(curl *, docker *, npm *, node *), Grep"
---

CONTEXT: Guide a new user from zero to their first deployed workflow. Chains: /n8n-setup → /n8n-connect → /n8n-init → /n8n-new.

STEPS:
1. CHECK if ~/.claude/n8n-config.json exists
2. IF connected → skip to step 8
3. ASK: Do you have n8n running? (yes/no)

### IF no n8n:
4. ASK: cloud or self-hosted?
5. IF cloud → guide to app.n8n.cloud signup → get API key
6. IF self-hosted → RUN /n8n-setup logic (docker or npm install)
7. WAIT until n8n is running and user has API key

### Connect:
8. RUN /n8n-connect logic: get URL + key → test → save config
9. VERIFY: GET /api/v1/workflows?limit=1 returns 200

### Initialize:
10. RUN /n8n-init logic: create .n8n-track/ structure
11. RUN /n8n-sync logic: pull existing workflows from instance

### First workflow:
12. ASK: "Describe a workflow you'd like to create — what should it do?"
13. RUN /n8n-new logic with user's description
14. SHOW result + suggest next steps

OUTPUT:
```
10x.in — Setup complete!
  Instance: <mode> @ <url>
  Workflows synced: <count>
  First workflow: "<name>" (ID: <id>)

You're ready. Try:
  /n8n-new <describe another workflow>
  /n8n-workflows — see all workflows
  /n8n-agent <task> — use N8N Factory pipeline
```

RULES:
- Never skip connection validation
- Guide, don't assume — ask at each decision point
- If any step fails, diagnose and help fix before continuing

$ARGUMENTS
