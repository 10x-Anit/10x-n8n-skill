---
description: "Check n8n connection health"
argument-hint: ""
---

CONTEXT: Verify n8n instance is reachable and API key works.

STEPS:
1. READ `~/.claude/n8n-config.json` → IF missing → `Not connected. Run /n8n-connect`
2. SHOW config: mode, baseUrl
3. TEST: `curl -s -H "X-N8N-API-KEY: <key>" "<baseUrl>/workflows?limit=1"`
4. IF 200 → `Connection: OK | Workflows: <count>`
5. IF fail → show error + troubleshoot:
   - Check n8n is running at <url>
   - Check API key valid (Settings > n8n API)
   - Cloud: needs Starter plan+
   - Run `/n8n-connect` to reconfigure

$ARGUMENTS
