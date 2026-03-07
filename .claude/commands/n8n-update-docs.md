---
description: "Pull latest node docs from docs.n8n.io — keep skill current"
argument-hint: "[node-type|all]"
---

CONTEXT: Fetch latest documentation from docs.n8n.io to update local reference files.
REQUIRES: docs/nodes/doc-links.json

STEPS:
1. READ docs/nodes/doc-links.json for URL index
2. IF specific node-type → lookup doc_url → FETCH page → extract params, creds, notes
3. IF `all` → iterate all entries, fetch in batches of 5
4. UPDATE docs/nodes/node-catalog.json with fresh data + last_doc_update timestamp
5. RUN /n8n-reindex to pick up changes

OUTPUT:
  Updated: <count> node references
  Source: docs.n8n.io

RULES:
- If fetch fails → web search: `n8n <name> documentation site:docs.n8n.io`
- Never delete existing catalog entries, only update
- Agents should trigger this when they encounter unknown nodes

REFERENCE: docs/nodes/doc-links.json, docs/nodes/node-catalog.json

$ARGUMENTS
