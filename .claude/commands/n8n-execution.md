---
description: "Get, stop, or delete a single execution"
argument-hint: "<get|stop|delete> <execution-id>"
---

CONTEXT: Manage one execution by ID
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. PARSE action from args: get, stop, delete
3. IF get → `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/executions/$id?includeData=true"`
4. IF stop → `curl -s -X POST -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/executions/$id/stop"`
5. IF delete → `curl -s -X DELETE -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/executions/$id"`
6. OUTPUT get → Execution #$id | Workflow: $name | Status: $status | Mode: $mode | Started: $time | Duration: $dur
7. OUTPUT stop/delete → "Execution #$id [stopped|deleted]."

RULES:
- Get includes node result summary when data available
- Stop only works on running/waiting executions
- Both action and ID are required args

$ARGUMENTS
