---
description: "Trigger a workflow execution by ID"
argument-hint: "<workflow-id>"
---

CONTEXT: Run a workflow on demand
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. IF no ID → list active workflows for user to pick: `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows?active=true"`
3. EXECUTE — `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" "$baseUrl/api/v1/workflows/$id/run" -d '{}'`
4. OUTPUT — `Workflow "$name" (ID: $id) triggered. Execution ID: $execId | Status: $status`
5. IF user wants to monitor → `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/executions/$execId?includeData=true"`

RULES:
- Workflow must exist before triggering
- Show execution ID immediately from response
- Offer to monitor only if user asks

$ARGUMENTS
