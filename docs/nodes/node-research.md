# n8n Node Research — ARCHIVAL REFERENCE ONLY

> **DO NOT read during workflow builds.** Use `python sandbox/engine.py find/search/detail` instead.
> The source index (node-index.json) has 546+ nodes extracted directly from the n8n repo.
> This file is kept for historical research notes only.

> Last updated: 2026-02-23
> Source: n8n GitHub repo (master branch) + docs.n8n.io

This document captures all research done on n8n node types, typeVersions, credential types, and parameter structures. It serves as a permanent reference so this research is never lost.

---

## Quick Reference Table — All 52 Nodes

| # | Node | Type String | typeVersion | Credential Type | Category |
|---|------|------------|-------------|-----------------|----------|
| 1 | Webhook | `n8n-nodes-base.webhook` | 2 | none | trigger |
| 2 | Schedule Trigger | `n8n-nodes-base.scheduleTrigger` | 1.2 | none | trigger |
| 3 | Manual Trigger | `n8n-nodes-base.manualTrigger` | 1 | none | trigger |
| 4 | Error Trigger | `n8n-nodes-base.errorTrigger` | 1 | none | trigger |
| 5 | n8n Trigger | `n8n-nodes-base.n8nTrigger` | 1 | none | trigger |
| 6 | Chat Trigger | `@n8n/n8n-nodes-langchain.chatTrigger` | 1.3 | none | trigger |
| 7 | HTTP Request | `n8n-nodes-base.httpRequest` | 4.2 | varies | core |
| 8 | Code | `n8n-nodes-base.code` | 2 | none | core |
| 9 | Set | `n8n-nodes-base.set` | 3.4 | none | core |
| 10 | IF | `n8n-nodes-base.if` | 2.2 | none | core |
| 11 | Switch | `n8n-nodes-base.switch` | 3.2 | none | core |
| 12 | Merge | `n8n-nodes-base.merge` | 3 | none | core |
| 13 | Split In Batches | `n8n-nodes-base.splitInBatches` | 3 | none | core |
| 14 | Wait | `n8n-nodes-base.wait` | 1.1 | none | core |
| 15 | No Operation | `n8n-nodes-base.noOp` | 1 | none | core |
| 16 | Respond to Webhook | `n8n-nodes-base.respondToWebhook` | 1.5 | none | core |
| 17 | Stop and Error | `n8n-nodes-base.stopAndError` | 1 | none | core |
| 18 | Crypto | `n8n-nodes-base.crypto` | 2 | none | core |
| 19 | DateTime | `n8n-nodes-base.dateTime` | 2 | none | core |
| 20 | HTML | `n8n-nodes-base.html` | 1.2 | none | core |
| 21 | Markdown | `n8n-nodes-base.markdown` | 1 | none | core |
| 22 | XML | `n8n-nodes-base.xml` | 1 | none | core |
| 23 | Spreadsheet File | `n8n-nodes-base.spreadsheetFile` | 2 | none | core |
| 24 | RSS Feed Read | `n8n-nodes-base.rssFeedRead` | 1.2 | none | core |
| 25 | Execute Command | `n8n-nodes-base.executeCommand` | 1 | none | core |
| 26 | Slack | `n8n-nodes-base.slack` | 2.2 | `slackApi` | integration |
| 27 | Telegram | `n8n-nodes-base.telegram` | 1.2 | `telegramApi` | integration |
| 28 | Discord | `n8n-nodes-base.discord` | 2 | `discordApi` | integration |
| 29 | Microsoft Teams | `n8n-nodes-base.microsoftTeams` | 2 | `microsoftTeamsOAuth2Api` | integration |
| 30 | Microsoft Outlook | `n8n-nodes-base.microsoftOutlook` | 2 | `microsoftOutlookOAuth2Api` | integration |
| 31 | OpenAI | `n8n-nodes-base.openAi` | 1.8 | `openAiApi` | integration |
| 32 | Google Sheets | `n8n-nodes-base.googleSheets` | 4.7 | `googleSheetsOAuth2Api` | integration |
| 33 | Gmail | `n8n-nodes-base.gmail` | 2.2 | `gmailOAuth2` | integration |
| 34 | Google Drive | `n8n-nodes-base.googleDrive` | 3 | `googleDriveOAuth2Api` | integration |
| 35 | Google Calendar | `n8n-nodes-base.googleCalendar` | 1.3 | `googleCalendarOAuth2Api` | integration |
| 36 | Airtable | `n8n-nodes-base.airtable` | 2.1 | `airtableTokenApi` | integration |
| 37 | GitHub | `n8n-nodes-base.github` | 1 | `githubApi` | integration |
| 38 | Notion | `n8n-nodes-base.notion` | 2.2 | `notionApi` | integration |
| 39 | Jira | `n8n-nodes-base.jira` | 1 | `jiraSoftwareCloudApi` | integration |
| 40 | Asana | `n8n-nodes-base.asana` | 1 | `asanaApi` | integration |
| 41 | Trello | `n8n-nodes-base.trello` | 1 | `trelloApi` | integration |
| 42 | Monday.com | `n8n-nodes-base.mondayCom` | 1 | `mondayComApi` | integration |
| 43 | HubSpot | `n8n-nodes-base.hubspot` | 2.2 | `hubspotAppToken` | integration |
| 44 | Salesforce | `n8n-nodes-base.salesforce` | 1 | `salesforceOAuth2Api` | integration |
| 45 | PostgreSQL | `n8n-nodes-base.postgres` | 2.5 | `postgres` | integration |
| 46 | MySQL | `n8n-nodes-base.mySql` | 2.5 | `mySql` | integration |
| 47 | MongoDB | `n8n-nodes-base.mongoDb` | 1 | `mongoDb` | integration |
| 48 | Redis | `n8n-nodes-base.redis` | 1 | `redis` | integration |
| 49 | AWS S3 | `n8n-nodes-base.awsS3` | 2 | `aws` | integration |
| 50 | AWS SES | `n8n-nodes-base.awsSes` | 1 | `aws` | integration |
| 51 | AWS Lambda | `n8n-nodes-base.awsLambda` | 1 | `aws` | integration |
| 52 | SendGrid | `n8n-nodes-base.sendGrid` | 1 | `sendGridApi` | integration |
| 53 | Stripe | `n8n-nodes-base.stripe` | 1 | `stripeApi` | integration |
| 54 | Supabase | `n8n-nodes-base.supabase` | 1 | `supabaseApi` | integration |
| 55 | SSH | `n8n-nodes-base.ssh` | 1 | `sshPassword`/`sshPrivateKey` | integration |
| 56 | FTP | `n8n-nodes-base.ftp` | 1 | `ftp`/`sftp` | integration |
| 57 | AI Agent | `@n8n/n8n-nodes-langchain.agent` | 3.1 | none (uses sub-nodes) | ai |
| 58 | OpenAI Chat Model | `@n8n/n8n-nodes-langchain.lmChatOpenAi` | 1.3 | `openAiApi` | ai |
| 59 | Basic LLM Chain | `@n8n/n8n-nodes-langchain.chainLlm` | 1.7 | none (uses sub-nodes) | ai |

---

## Research Sources

- **n8n GitHub**: https://github.com/n8n-io/n8n (master branch, Feb 2026)
  - `packages/nodes-base/nodes/` — All node `.node.ts` files contain `defaultVersion` property
  - `packages/@n8n/nodes-langchain/nodes/` — AI/LangChain nodes
- **n8n Docs**: https://docs.n8n.io/integrations/builtin/
  - Core nodes: `/core-nodes/`
  - App nodes: `/app-nodes/`
  - Trigger nodes: `/trigger-nodes/`
  - Cluster (AI) nodes: `/cluster-nodes/`

---

## Key Findings

### 1. typeVersion is CRITICAL
- Every node in n8n has a `defaultVersion` in its source code
- When building workflow JSON, `typeVersion` must be included
- Missing `typeVersion` causes n8n to show question-mark icons on nodes
- The version number determines which code path n8n uses to process the node

### 2. Code Node v2 Breaking Change
- Code v1 used `mode` parameter: `runOnceForAllItems` | `runOnceForEachItem`
- Code v2 uses `language` parameter: `javaScript` | `python`
- The old `mode` param does NOT exist in v2

### 3. Connection Format
```json
{
  "connections": {
    "Source Node Name": {
      "main": [
        [
          { "node": "Target Node Name", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

For branching (IF node with 2 outputs):
```json
{
  "IF Node": {
    "main": [
      [ { "node": "True Target", "type": "main", "index": 0 } ],
      [ { "node": "False Target", "type": "main", "index": 0 } ]
    ]
  }
}
```

### 4. AI Sub-Node Connections
AI sub-nodes (like `lmChatOpenAi`) use special connector types:
- `ai_languageModel` — LLM model connection
- `ai_tool` — Tool connection
- `ai_memory` — Memory connection
- `ai_outputParser` — Output parser connection

These are NOT connected via `main` connections.

### 5. Credential Format
Credentials are always referenced as:
```json
{
  "credentials": {
    "<credentialType>": {
      "id": "<credential-id>",
      "name": "<credential-display-name>"
    }
  }
}
```

### 6. API Methods
- **Create workflow**: `POST /api/v1/workflows`
- **Update workflow**: `PATCH /api/v1/workflows/:id` (NOT PUT)
- **Activate workflow**: `PATCH /api/v1/workflows/:id` with `{ "active": true }` (NO separate /activate endpoint)
- **Get workflow**: `GET /api/v1/workflows/:id`
- **List workflows**: `GET /api/v1/workflows`
- **Delete workflow**: `DELETE /api/v1/workflows/:id`
- **Get executions**: `GET /api/v1/executions?workflowId=:id`
- **Create credentials**: `POST /api/v1/credentials`
- **Get credentials**: `GET /api/v1/credentials`

### 7. Required Workflow JSON Structure
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "id": "<uuid>",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "typeVersion": 1.0,
      "position": [250, 300],
      "parameters": {},
      "credentials": {}
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
```

### 8. Google Nodes — Credential Scoping
Each Google service has its own credential type despite all being Google OAuth2:
- `googleSheetsOAuth2Api` — Google Sheets
- `gmailOAuth2` — Gmail
- `googleDriveOAuth2Api` — Google Drive
- `googleCalendarOAuth2Api` — Google Calendar
- `googleApi` — Service Account (shared across Google services)

### 9. AWS Nodes — Shared Credential
All AWS nodes share a single `aws` credential type:
- `awsS3`, `awsSes`, `awsLambda` all use `"aws"` credential
- The credential stores Access Key ID, Secret Access Key, Region

### 10. Deprecated Nodes
- `Function` node → replaced by `Code` node v2
- `FunctionItem` node → replaced by `Code` node v2
- These should NEVER be used in new workflows

---

## HTTP Request Node — Full Power Reference

The HTTP Request node (`n8n-nodes-base.httpRequest`, typeVersion 4.2) is the most versatile node. It supports:

### Authentication Types
| Auth Type | `authentication` value | `genericAuthType` value | Credential Type |
|-----------|----------------------|------------------------|-----------------|
| None | `none` | — | — |
| API Key (Header) | `genericCredentialType` | `httpHeaderAuth` | `httpHeaderAuth` |
| Basic Auth | `genericCredentialType` | `httpBasicAuth` | `httpBasicAuth` |
| Digest Auth | `genericCredentialType` | `httpDigestAuth` | `httpDigestAuth` |
| Query String | `genericCredentialType` | `httpQueryAuth` | `httpQueryAuth` |
| OAuth1 | `genericCredentialType` | `oAuth1Api` | `oAuth1Api` |
| OAuth2 | `genericCredentialType` | `oAuth2Api` | `oAuth2Api` |
| Predefined Service | `predefinedCredentialType` | — | (service-specific) |

### Body Types
| Body Type | `contentType` value | Notes |
|-----------|-------------------|-------|
| JSON | `json` | Most common. Use `specifyBody: "json"` + `jsonBody` |
| Form URL Encoded | `form-urlencoded` | Key-value pairs |
| Multipart Form | `multipart-form-data` | File uploads |
| Raw/Custom | `raw` | Custom content type |
| Binary | `binaryData` | Send binary file from previous node |

### Advanced Features
- **Pagination**: Auto-paginate through API results
- **Batching**: Rate-limit requests with batch size + interval
- **Proxy**: Route through proxy server
- **Timeout**: Custom request timeout
- **SSL Certificates**: Custom SSL certs
- **Redirects**: Control redirect following
- **Full Response**: Get headers + status code (not just body)
- **Never Error**: Don't fail on 4xx/5xx responses

---

## AI Workflow Architecture

AI workflows in n8n use a "cluster node" pattern:

```
[Chat Trigger] → [AI Agent] ← [OpenAI Chat Model]  (sub-node via ai_languageModel)
                      ↑
                [Tool Node]  (sub-node via ai_tool)
                      ↑
                [Memory Node]  (sub-node via ai_memory)
```

### Root Nodes (have main connections)
- `@n8n/n8n-nodes-langchain.agent` — Full agent with tools
- `@n8n/n8n-nodes-langchain.chainLlm` — Simple prompt → LLM → response

### Sub-Nodes (connect via special connectors, NOT main)
- `@n8n/n8n-nodes-langchain.lmChatOpenAi` — OpenAI LLM
- Various tool nodes, memory nodes, output parsers

### Connection Format for AI Sub-Nodes
AI sub-nodes use a different connection format than regular nodes:
```json
{
  "AI Agent": {
    "ai_languageModel": [
      [{ "node": "OpenAI Chat Model", "type": "ai_languageModel", "index": 0 }]
    ],
    "ai_tool": [
      [{ "node": "Calculator", "type": "ai_tool", "index": 0 }]
    ]
  }
}
```
