---
description: "Discover node types from n8n instance — update catalog"
argument-hint: "[--force]"
---

CONTEXT: Fetch available node types from connected n8n. Updates local catalog with new nodes.
REQUIRES: ~/.claude/n8n-config.json

STEPS:
1. CHECK docs/nodes/live-nodes.json age — IF fresh (<24h) AND no --force → show cached
2. TRY internal endpoint: `curl -s -H "X-N8N-API-KEY: <key>" "<baseUrl>/rest/node-types"`
3. IF fails → FALLBACK: scan workflows for node types via GET /api/v1/workflows
4. FOR each discovered node:
   - Extract: type string, category, credential types, parameter names
   - Generate doc_url: `https://docs.n8n.io/integrations/builtin/<category>-nodes/<type>/`
5. SAVE to docs/nodes/live-nodes.json
6. MERGE new nodes into docs/nodes/node-catalog.json (add doc_url, discovered_at)
7. REBUILD docs/nodes/doc-links.json

OUTPUT:
  Discovered: <count> node types (Core: <n>, Triggers: <n>, Apps: <n>)
  New nodes added: <count>
  Catalog updated: docs/nodes/node-catalog.json

RULES:
- Never overwrite manually-curated catalog entries
- Always include doc_url for every discovered node
- Cache results for 24 hours unless --force

$ARGUMENTS
