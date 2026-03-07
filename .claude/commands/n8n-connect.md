---
description: "Connect to n8n — cloud or self-hosted"
argument-hint: "[cloud|self-hosted] [url] [api-key]"
---

CONTEXT: Save n8n connection config. All other commands depend on this.
REQUIRES: User's n8n base URL + API key

STEPS:
1. IF $ARGUMENTS has mode + url + key → skip to step 4
2. ASK mode: `cloud` or `self-hosted`
3. ASK base URL + API key
   - cloud default: `https://<name>.app.n8n.cloud`
   - self-hosted default: `http://localhost:5678`
4. TEST connection:
   `curl -s -o /dev/null -w "%{http_code}" -H "X-N8N-API-KEY: <key>" "<url>/api/v1/workflows?limit=1"`
5. IF 200 → WRITE `~/.claude/n8n-config.json`:
   `{"mode":"<m>","baseUrl":"<url>/api/v1","apiKey":"<key>"}`
6. IF fail → show error. Suggest: check URL, check key, check n8n running, cloud needs Starter+

OUTPUT: `Connected: <mode> @ <url>`

RULES:
- Auth header: `X-N8N-API-KEY`
- Never log API key in output
- Cloud requires Starter plan+ for API access
- No n8n installed? Suggest `/n8n-setup`

$ARGUMENTS
