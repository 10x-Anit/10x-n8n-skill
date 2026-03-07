---
description: "Remove n8n connection config"
argument-hint: ""
---

CONTEXT: Delete stored n8n connection. Reversible via `/n8n-connect`.

STEPS:
1. IF `~/.claude/n8n-config.json` exists → DELETE it
2. IF missing → show: `No connection configured.`

OUTPUT: `Disconnected. Config removed. Run /n8n-connect to reconnect.`

$ARGUMENTS
