---
description: "Create n8n credentials from env vars and map to workflow nodes"
argument-hint: "<project-slug>"
---

CONTEXT: projects/<slug>/.env + draft/workflow.json + node-catalog.json
REQUIRES: project with .env filled, n8n API connection

STEPS:
1. READ draft/workflow.json → identify nodes needing credentials
2. READ docs/nodes/node-catalog.json → map node types to cred types + env var names
3. READ projects/<slug>/.env → get secret values
4. IF any env vars missing → stop, show `/n8n-env <slug> set <KEY> <value>`
5. POST /api/v1/credentials for each cred type with data from .env
6. SAVE returned IDs to credentials/cred-map.json
7. UPDATE draft/workflow.json with credential references per node
8. OUTPUT — table: `CredType | ID | Mapped To`

RULES:
- Secrets sent to API once, never stored locally beyond .env
- Name credentials as `<slug>-<credType>`
- Stop on missing env vars — never create partial credentials
