---
description: "Self-update the skill — discover new nodes, pull latest docs, rebuild index"
argument-hint: "[--full|--nodes|--docs|--index]"
allowed-tools: "Read, Write, Bash(curl *), Grep, Glob, WebFetch, WebSearch"
---

CONTEXT: Keep the skill's reference files current with n8n updates. Chains: /n8n-discover + /n8n-update-docs + /n8n-reindex.

REQUIRES: ~/.claude/n8n-config.json

STEPS:
1. READ config — confirm connected
2. PARSE $ARGUMENTS — determine scope: full | nodes | docs | index

### IF --nodes OR --full:
3. RUN /n8n-discover logic:
   - TRY `<baseUrl>/rest/node-types` → IF fails → scan workflows for node types
   - SAVE to docs/nodes/live-nodes.json
   - MERGE new nodes into docs/nodes/node-catalog.json (add doc_url, discovered_at)
   - REBUILD docs/nodes/doc-links.json

### IF --docs OR --full:
4. RUN /n8n-update-docs logic:
   - READ docs/nodes/doc-links.json for URLs
   - FETCH each doc page → extract params, credential info, options
   - UPDATE docs/nodes/node-catalog.json with fresh data
5. CHECK key n8n docs for updates:
   - https://docs.n8n.io/api/api-reference/ → new API endpoints?
   - https://docs.n8n.io/hosting/configuration/environment-variables/ → new env vars?

### IF --index OR --full:
6. RUN /n8n-reindex logic:
   - SCAN all files in docs/, projects/, .n8n-track/
   - EXTRACT semantic tags per section
   - WRITE .n8n-track/index/context-map.json + line-index.json

### Always:
7. UPDATE docs/nodes/node-catalog.json _last_updated timestamp

OUTPUT:
```
N8N Skill Evolution @ <timestamp>

  Nodes discovered: <count> (<new_count> new)
  Docs updated: <count> node references
  Index rebuilt: <entry_count> entries

  Catalog: docs/nodes/node-catalog.json
  Doc links: docs/nodes/doc-links.json
  Index: .n8n-track/index/context-map.json

Skill is current with n8n instance + docs.n8n.io
```

RULES:
- Never delete existing catalog entries — only add or update
- Always include doc_url for every discovered node
- Cache live-nodes.json for 24h unless --full forces refresh
- If a doc page fetch fails → web search as fallback: `n8n <name> site:docs.n8n.io`

$ARGUMENTS
