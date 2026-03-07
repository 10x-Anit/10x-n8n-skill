---
description: "Rebuild context index from docs/ and snapshots/"
argument-hint: ""
---

CONTEXT: docs/*.md + .n8n-track/snapshots/ → index/
REQUIRES: docs/ directory or snapshots/ with content

STEPS:
1. SCAN docs/*.md → parse headers as section boundaries, extract semantic tags, record line ranges
2. DETECT API endpoints (GET/POST/etc.) → add method + path as tags
3. SCAN .n8n-track/snapshots/ → extract node types, workflow metadata, map to line ranges
4. WRITE context-map.json: files, symbols (inverted index), refs (forward index)
5. WRITE line-index.json: flat entries map of file:lines → [tags]
6. OUTPUT — `Files: N | Sections: N | Unique tags: N`

RULES:
- Strip stop words from tags, keep meaningful terms only
- Both forward and inverted index in context-map.json
- Include version and generated_at timestamp in index files
