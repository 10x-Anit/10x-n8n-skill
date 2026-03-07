---
description: "Show webhook URLs for a workflow"
argument-hint: "<workflow-id>"
---

CONTEXT: Extract and display webhook trigger URLs from a workflow
REQUIRES: ~/.claude/n8n-config.json (run /n8n-connect if missing)

STEPS:
1. READ config → extract `baseUrl`, `apiKey` from ~/.claude/n8n-config.json
2. EXECUTE — `curl -s -H "X-N8N-API-KEY: $apiKey" "$baseUrl/api/v1/workflows/$id"`
3. PARSE nodes where type = `n8n-nodes-base.webhook`
4. IF no webhook nodes → "This workflow has no webhook trigger nodes."
5. OUTPUT per webhook node:

Node: $nodeName | Method: $httpMethod | Path: $path
Production: $baseUrl/webhook/$path
Test: $baseUrl/webhook-test/$path

6. SHOW curl example: `curl -X $METHOD "$baseUrl/webhook/$path" -H "Content-Type: application/json" -d '{"key":"value"}'`

RULES:
- Workflow ID is required
- List all webhook nodes, not just the first
- Show both production and test URLs for each node

$ARGUMENTS
