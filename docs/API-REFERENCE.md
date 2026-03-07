# API Reference — 10x-n8n-skill

All modules are ESM and can be imported individually.

## Installation

```bash
npm install 10x-n8n-skill
```

---

## lib/api.js — n8n REST API Wrapper

```js
import { listWorkflows, getWorkflow, createWorkflow } from '10x-n8n-skill';
```

### Workflows

| Function | Params | Returns | API Endpoint |
|----------|--------|---------|-------------|
| `listWorkflows()` | none | `{data: [{id, name, active, ...}]}` | `GET /workflows` |
| `getWorkflow(id)` | `id: string` | workflow object | `GET /workflows/{id}` |
| `createWorkflow(data)` | `data: {name, nodes, connections, settings}` | created workflow | `POST /workflows` |
| `updateWorkflow(id, data)` | `id, data` | updated workflow | `PATCH /workflows/{id}` |
| `deleteWorkflow(id)` | `id: string` | void | `DELETE /workflows/{id}` |
| `activateWorkflow(id)` | `id: string` | updated workflow | `PATCH /workflows/{id}` |
| `deactivateWorkflow(id)` | `id: string` | updated workflow | `PATCH /workflows/{id}` |

### Executions

| Function | Params | Returns | API Endpoint |
|----------|--------|---------|-------------|
| `executeWorkflow(id)` | `id: string` | execution result | `POST /workflows/{id}/run` |
| `listExecutions(filters)` | `{workflowId?, status?, limit?}` | `{data: [...]}` | `GET /executions` |
| `getExecution(id)` | `id: string` | execution object | `GET /executions/{id}` |
| `stopExecution(id)` | `id: string` | void | `POST /executions/{id}/stop` |
| `deleteExecution(id)` | `id: string` | void | `DELETE /executions/{id}` |

### Credentials

| Function | Params | Returns | API Endpoint |
|----------|--------|---------|-------------|
| `listCredentials()` | none | `{data: [...]}` | `GET /credentials` |
| `createCredential(data)` | `{name, type, data}` | created credential | `POST /credentials` |
| `deleteCredential(id)` | `id: string` | void | `DELETE /credentials/{id}` |
| `getCredentialSchema(type)` | `type: string` | schema object | `GET /credentials/schema/{type}` |

### Tags & Variables

| Function | Params | Returns | API Endpoint |
|----------|--------|---------|-------------|
| `listTags()` | none | `{data: [...]}` | `GET /tags` |
| `createTag(name)` | `name: string` | tag object | `POST /tags` |
| `listVariables()` | none | `{data: [...]}` | `GET /variables` |

### Health

| Function | Returns |
|----------|---------|
| `healthCheck()` | `{ok: boolean, error?: string}` |

All functions use the config from `~/.claude/n8n-config.json`. Auth header `X-N8N-API-KEY` is added automatically.

---

## lib/config.js — Connection Config

```js
import { getConfig, saveConfig, deleteConfig } from '10x-n8n-skill/config';
```

| Function | Params | Returns |
|----------|--------|---------|
| `getConfig()` | none | `{mode, baseUrl, apiKey}` or `null` |
| `saveConfig(config)` | `{mode, baseUrl, apiKey, label?}` | void |
| `deleteConfig()` | none | void |

Config path: `~/.claude/n8n-config.json`

---

## lib/tracker.js — Git-like Tracking

```js
import { initTracker, commitWorkflow, getCommitLog } from '10x-n8n-skill/tracker';
```

| Function | Params | Returns |
|----------|--------|---------|
| `initTracker(instance, mode)` | instance URL, mode | tracker state |
| `commitWorkflow(workflowId, message, workflowJson)` | id, message, JSON | commit hash |
| `getCommitLog(workflowId?)` | optional filter | array of commits |
| `logExecution(executionData)` | execution object | void |
| `createBranch(name, workflowId)` | branch name, wf id | branch object |
| `switchBranch(name)` | branch name | updated HEAD |
| `getDiff(workflowId, fromHash?, toHash?)` | id, optional hashes | diff object |
| `getTrackerState()` | none | full state |

Data stored in `.n8n-track/` directory.

---

## lib/agents.js — N8N Factory Pipeline

```js
import { PIPELINE, buildAgentPrompt, createHandoff } from '10x-n8n-skill/agents';
```

| Export | Type | Description |
|--------|------|-------------|
| `PIPELINE` | `string[]` | `['intelligence','design','production','compliance','operations','records']` |
| `getAgentRoles()` | function | Returns all 6 department definitions |
| `getAgentRole(id)` | function | Returns one department by ID |
| `getNextAgent(current)` | function | Next department in pipeline |
| `buildAgentPrompt(roleId, task, contextRefs, payload)` | function | Build focused prompt for a department |
| `createHandoff(from, to, task, refs, payload, report)` | function | Create handoff ticket |
| `listHandoffs(filter?)` | function | List tickets `{to?, from?, status?}` |
| `pickHandoff(id)` | function | Claim a ticket |
| `completeHandoff(id, result?)` | function | Mark done |
| `failHandoff(id, error, handBackTo?)` | function | Mark failed + retry |
| `getPipelineState()` | function | Status of all departments |
| `cleanHandoffs(maxAgeMs?)` | function | Purge old tickets |

---

## lib/project.js — Project Isolation

```js
import { createProject, getDraft, saveDraft } from '10x-n8n-skill/project';
```

| Function | Params | Description |
|----------|--------|-------------|
| `createProject(slug, name, workflowJson?)` | slug, name, optional JSON | Create project folder with full structure |
| `getProject(slug)` | slug | Read meta.json |
| `getDraft(slug)` | slug | Read draft/workflow.json |
| `saveDraft(slug, json)` | slug, JSON | Write draft/workflow.json |
| `getOriginal(slug)` | slug | Read original/workflow.json |
| `saveCheckpoint(slug, message?)` | slug, optional message | Save to checkpoints/vN.json |
| `listCheckpoints(slug)` | slug | List all vN.json files |
| `rollback(slug, version)` | slug, version number or 'original' | Copy version to draft |
| `markPublished(slug, workflowId, json)` | slug, id, JSON | Update original + meta |
| `readEnv(slug)` | slug | Parse .env file |
| `addCredMapping(slug, nodeType, credType, credId)` | slug, type, cred, id | Update cred-map.json |

---

## lib/discovery.js — Node Discovery

```js
import { fetchLiveNodeTypes, getNodeDocUrl } from '10x-n8n-skill/discovery';
```

| Function | Params | Description |
|----------|--------|-------------|
| `getNodeDocUrl(type)` | node type string | Build official doc URL |
| `fetchLiveNodeTypes()` | none (uses config) | Fetch from n8n instance |
| `saveLiveNodes(nodes)` | array of nodes | Save to live-nodes.json |
| `getLiveNodes()` | none | Read cached live-nodes.json |
| `isLiveNodesCacheStale(hours?)` | max age in hours | Check cache freshness |
| `buildDocLinks(liveNodes)` | live nodes data | Build doc-links.json |
| `mergeLiveIntoCatalog(nodes)` | array of nodes | Add new nodes to catalog |
| `N8N_DOC_URLS` | object | All official n8n doc base URLs |

---

## lib/credentials.js — Credential Management

```js
import { analyzeCredentialNeeds, setupAllCredentials } from '10x-n8n-skill/credentials';
```

| Function | Params | Description |
|----------|--------|-------------|
| `analyzeCredentialNeeds(workflowJson)` | workflow JSON | Detect needed credentials |
| `setupAllCredentials(needs, envVars)` | needs + env vars | Create all in n8n via API |
| `generateEnvTemplate(needs)` | credential needs | Generate .env template string |
| `NODE_CREDENTIAL_MAP` | object | 20+ node type → credential mappings |

---

## lib/indexer.js — Context Index

```js
import { rebuildIndex, queryContext } from '10x-n8n-skill/indexer';
```

| Function | Params | Description |
|----------|--------|-------------|
| `rebuildIndex(rootDir)` | root directory path | Scan files, build context-map + line-index |
| `queryContext(tags)` | array of search terms | Find matching file:line ranges |

---

## lib/syncer.js — n8n ↔ Local Sync

```js
import { syncWorkflows, syncExecutions } from '10x-n8n-skill/syncer';
```

| Function | Description |
|----------|-------------|
| `syncWorkflows()` | Pull all workflows from n8n, update local refs |
| `syncExecutions(workflowId?, limit?)` | Pull executions, append to log |
