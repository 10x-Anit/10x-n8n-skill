---
description: "Show execution history — status, duration, one line per run"
argument-hint: "[workflow-id] [--status=success|error] [--limit=N]"
---

CONTEXT: .n8n-track/executions.jsonl
REQUIRES: initialized .n8n-track/

STEPS:
1. VERIFY initialized
2. READ executions.jsonl, apply filters: workflow-id, --status, --limit (default 30)
3. SORT reverse chronological
4. IF status=FAIL and error available → show error message inline
5. OUTPUT — `ID | Workflow | Status | Duration | Trigger | Time` per line
6. IF no executions → "No executions logged. Run /n8n-sync"

RULES:
- Footer: `Showing N/total | Success: N | Failed: N | Running: N`
- Duration in human units (ms/s)
- Show error detail for failed runs
