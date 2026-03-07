---
description: "Show commit history, one line per commit"
argument-hint: "[workflow-id] [--limit=N]"
---

CONTEXT: .n8n-track/commits.jsonl
REQUIRES: initialized .n8n-track/

STEPS:
1. VERIFY initialized
2. READ commits.jsonl
3. IF workflow-id provided → filter by wf field
4. SORT reverse chronological, limit to N (default 20)
5. OUTPUT — `<hash> <timestamp> [workflow-<id>] <message>` per line
6. IF no commits → "No commits yet. Run /n8n-sync to pull workflows."

RULES:
- Show truncated hash (10 chars)
- Footer: `Showing N/total commits`
- Newest first
