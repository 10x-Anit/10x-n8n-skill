---
description: "List recent workflow executions with optional filters"
argument-hint: "[workflow-id] [--status=success|error|running|waiting]"
---

CONTEXT: View execution history across workflows
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. BUILD query params: `?limit=20`
3. IF workflow-id → append `&workflowId=$id`
4. IF --status → append `&status=$status`
5. EXECUTE — `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/executions$queryParams"`
6. OUTPUT — table:

| ID | Workflow | Status | Started | Duration |
|----|----------|--------|---------|----------|

Total: [count] executions shown

RULES:
- Default limit = 20, max per request = 250
- Duration = calculated from startedAt/stoppedAt, show "—" if running
- Show applied filters above table if any

$ARGUMENTS
