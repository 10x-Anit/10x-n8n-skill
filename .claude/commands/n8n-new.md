---
description: "Create a new n8n workflow from natural language description"
argument-hint: "<describe your workflow in plain english>"
---

CONTEXT: Build and deploy an n8n workflow using the Python sandbox.
REQUIRES: ~/.claude/n8n-config.json (connected)

## CORE PRINCIPLE: PROGRAMMATIC-FIRST, ZERO HALLUCINATION

This skill uses Python scripts backed by a 546-node source index (extracted from the actual n8n GitHub repo) to look up nodes, build JSON, and validate. NEVER assume or guess node types, versions, or parameters.

When something is missing: DOWNLOAD and verify from source, don't guess.

## STEPS

1. **INIT** — Run `python sandbox/engine.py init` (first time only)

2. **READ config** — `~/.claude/n8n-config.json` — get baseUrl + apiKey

3. **CHECK past actions** — `python sandbox/engine.py recall "wf:<similar-name>"`

4. **PARSE user description** — Extract: purpose, trigger type, processing steps, integrations, name + slug

5. **LOOKUP nodes** — Get exact types, versions, credentials from source index:
   ```bash
   python sandbox/engine.py find webhook,httpRequest,code,slack
   ```
   If unsure about node name:
   ```bash
   python sandbox/engine.py search "email"
   ```
   For detailed parameter info from TypeScript source:
   ```bash
   python sandbox/engine.py detail slack
   python sandbox/engine.py grep "operation" slack
   ```

6. **GET rules** — `python sandbox/engine.py rules`

7. **GET template** (if needed) — `python sandbox/engine.py template <keyword>`

8. **CREATE project folder** — `projects/<slug>/` with meta.json, .env, env.schema.json, original/, draft/, checkpoints/, credentials/

9. **DETECT credentials** — From `find` output, check which nodes need credentials

10. **ASK user for .env values** — HALT until all required secret values provided

11. **CREATE credentials** — `POST /api/v1/credentials` -> save IDs to cred-map.json

12. **BUILD workflow** — Create spec JSON and run:
    ```bash
    python sandbox/engine.py build spec.json projects/<slug>/draft/workflow.json
    ```
    Builder auto-handles: type resolution from source index, UUIDs, grid positions, validation, logging.

13. **POST to n8n** — `POST <baseUrl>/api/v1/workflows` with the built JSON

14. **SAVE** — API response -> original/workflow.json, update meta.json, append to history.jsonl

## SPEC FORMAT

```json
{
  "name": "Workflow Name",
  "nodes": [
    {"key": "webhook", "name": "My Webhook", "params": {"httpMethod": "POST", "path": "incoming"}},
    {"key": "code", "name": "Process", "params": {"language": "javaScript", "jsCode": "return $input.all();"}},
    {"key": "slack", "name": "Notify", "params": {"resource": "message", "operation": "send", "channel": "#alerts"},
     "credentials": {"slackApi": {"id": "CRED_ID", "name": "Slack"}}}
  ],
  "connections": [
    {"from": "My Webhook", "to": "Process"},
    {"from": "Process", "to": "Notify"}
  ]
}
```

For IF branching: `{"from": "Check", "to": ["True Branch", "False Branch"]}`

## OUTPUT
```
Workflow created: "<name>"
  ID: <workflow-id> | Nodes: <count> | Credentials: <count>
  Status: inactive | Project: projects/<slug>/
Next: /n8n-checkpoint <slug>
```

## RULES
- ALWAYS use sandbox/engine.py — never read catalog files directly
- NEVER assume typeVersion — verify via `engine.py find` (backed by n8n source repo)
- `engine.py find/search/detail/grep` for lookups — no guessing
- `engine.py build` creates valid JSON — no manual JSON construction
- `engine.py validate` catches issues before deployment
- HALT at step 10 until user provides env values
- Check `engine.py recall` first to reuse past successful approaches
- When in doubt: download, grep, verify — don't hallucinate

$ARGUMENTS
