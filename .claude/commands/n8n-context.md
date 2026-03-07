---
description: "Query context index — find relevant file:line ranges by topic"
argument-hint: "<query terms>"
---

CONTEXT: .n8n-track/index/context-map.json
REQUIRES: index exists (run /n8n-reindex first)

STEPS:
1. VERIFY context-map.json exists
2. PARSE query terms from arguments
3. LOOKUP each term in symbols map → collect file:line references
4. SCORE references by matching term count, sort descending
5. OUTPUT top 10: `Score | file:line_start-line_end | [tags]`
6. IF no results → "No matching context. Try different terms or /n8n-reindex"

RULES:
- Return ONLY file:line ranges — never full file contents
- Designed for token-efficient agent consumption
- Max 10 results
