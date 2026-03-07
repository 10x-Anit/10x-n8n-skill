---
description: "Dispatch task to the N8N Factory — 6-department pipeline"
argument-hint: "<task in natural language>"
---

CONTEXT: Route a workflow task through 6 specialized departments. Each does ONE thing, audits output, hands off.
REQUIRES: ~/.claude/n8n-config.json, .n8n-track/agents.json, docs/nodes/node-catalog.json

PIPELINE: Intelligence → Design → Production → Compliance → Operations → Records

STEPS:
1. READ .n8n-track/agents.json for department definitions
2. PARSE $ARGUMENTS → extract: purpose, trigger type, integrations needed, workflow name
3. RUN INTELLIGENCE:
   - READ docs/nodes/node-catalog.json + docs/nodes/workflow-patterns.json
   - FIND exact node types, credential types, doc_urls for each needed node
   - IF node not in catalog → web search: `n8n <name> site:docs.n8n.io`
   - AUDIT: every type verified, doc_urls present, cred types listed
   - HANDOFF payload: {nodes_needed, pattern, credential_needs}
4. RUN DESIGN:
   - DEFINE node order, connections, branch logic, grid positions
   - MATCH to known pattern from workflow-patterns.json
   - AUDIT: 1 trigger, all connections valid, no orphans, positions clean
   - HANDOFF payload: {blueprint with nodes, connections, positions, cred_map}
5. RUN PRODUCTION:
   - BUILD workflow JSON from blueprint using node-catalog.json params
   - READ projects/<slug>/.env → create credentials via API
   - WIRE credential IDs into nodes
   - AUDIT: valid JSON, all required params set, all cred IDs exist
   - HANDOFF payload: {workflow.json path, cred-map.json}
6. RUN COMPLIANCE:
   - CHECK each node's params against catalog
   - VERIFY credentials exist in n8n: GET /api/v1/credentials
   - VALIDATE connections match blueprint
   - IF ANY fail → RETURN to Production with exact error
   - AUDIT: PASS/FAIL per check
7. RUN OPERATIONS:
   - POST /api/v1/workflows with workflow JSON
   - IF update → PATCH /api/v1/workflows/<id>
   - TRIGGER test: POST /api/v1/workflows/<id>/run
   - CAPTURE execution result
   - AUDIT: workflow exists, execution status captured
8. RUN RECORDS:
   - SAVE checkpoint to projects/<slug>/checkpoints/
   - APPEND to .n8n-track/commits.jsonl
   - UPDATE refs, history, index
   - IF execution failed → diagnose error → RETURN to Production

OUTPUT per department:
  [INTELLIGENCE] Found: <nodes> (<count> nodes, <count> creds) ✓
  [DESIGN]       Blueprint: <count> nodes, <count> connections ✓
  [PRODUCTION]   Built: workflow.json + <count> credentials ✓
  [COMPLIANCE]   All checks: PASS ✓
  [OPERATIONS]   Deployed: ID <id>, Execution #<n> <status> ✓
  [RECORDS]      Checkpoint v<n> saved ✓

RULES:
- Each department reads ONLY referenced files — never full codebase
- Compliance failure → back to Production (max 3 retries)
- After 3 retries → halt + report full error chain to user
- Every node must have doc_url from node-catalog.json
- Never guess credential fields — always check catalog or schema API

REFERENCE:
- docs/nodes/node-catalog.json — node types, params, creds
- docs/nodes/workflow-patterns.json — known good patterns
- docs/nodes/doc-links.json — official doc URLs
- .n8n-track/agents.json — department definitions + budgets

$ARGUMENTS
