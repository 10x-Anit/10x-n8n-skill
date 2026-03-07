# 10x-n8n-skill

**N8N Factory** — AI skill plugin that turns natural language into deployed n8n workflows.

Works with **Claude Code**, **OpenCode**, and other AI coding assistants. Cross-model compatible: DeepSeek, Claude Haiku/Sonnet/Opus, GPT-4/5, Gemini, and more.

```
"Create a webhook that receives GitHub issues and posts them to Slack"

  [INTELLIGENCE] Found: webhook, code, slack (3 nodes, 1 credential) ✓
  [DESIGN]       Blueprint: webhook-to-action pattern ✓
  [PRODUCTION]   Built: workflow.json + slackApi credential ✓
  [COMPLIANCE]   All checks PASS ✓
  [OPERATIONS]   Deployed: ID 42, Execution #789 SUCCESS ✓
  [RECORDS]      Checkpoint v1 saved ✓

  Workflow "GitHub to Slack" is live.
```

## Install

```bash
npm install -g 10x-n8n-skill
```

Commands auto-register to your AI coding assistant on install.

### Manual install (Claude Code plugin)

```bash
git clone https://github.com/10x-Anit/10x-n8n-skill.git
claude --plugin-dir ./10x-n8n-skill
```

## Quick Start

```
/n8n-connect                          → connect to your n8n instance
/n8n-new "send daily sales to Slack"  → create a workflow from English
/n8n-publish my-workflow              → deploy to n8n
```

Or use the guided setup:

```
/n8n-onboard                          → zero to first workflow
```

## What's Inside

### 41 Atomic Commands

Single-purpose operations. 1 command = 1 action.

| Category | Commands |
|----------|----------|
| **Setup** | `/n8n-connect`, `/n8n-disconnect`, `/n8n-status`, `/n8n-setup` |
| **Lifecycle** | `/n8n-new`, `/n8n-import`, `/n8n-modify`, `/n8n-checkpoint`, `/n8n-publish`, `/n8n-rollback` |
| **Credentials** | `/n8n-env`, `/n8n-cred-setup` |
| **API** | `/n8n-workflows`, `/n8n-workflow`, `/n8n-execute`, `/n8n-executions`, `/n8n-credentials`, `/n8n-tags`, `/n8n-variables`, `/n8n-export` |
| **Tracking** | `/n8n-init`, `/n8n-sync`, `/n8n-commit`, `/n8n-diff`, `/n8n-log`, `/n8n-branch` |
| **Factory** | `/n8n-agent`, `/n8n-agent-status`, `/n8n-discover`, `/n8n-update-docs` |

### 5 Composed Skills

Intelligent workflows that chain multiple commands together.

| Skill | What it does |
|-------|-------------|
| **`/n8n-factory`** | Full 6-department pipeline: natural language → deployed workflow |
| **`/n8n-lifecycle`** | Guided create → modify → test → checkpoint → publish cycle |
| **`/n8n-onboard`** | First-time setup: install → connect → initialize → first workflow |
| **`/n8n-diagnose`** | Debug failing workflows: check executions, trace errors, suggest fixes |
| **`/n8n-evolve`** | Self-update: discover new nodes, pull latest docs, rebuild index |

## Architecture

### Three Layers

```
┌──────────────────────────────────────────────┐
│  PROJECT ISOLATION                            │
│  projects/<slug>/ — 1 folder per workflow     │
│  original → draft → checkpoint → publish      │
├──────────────────────────────────────────────┤
│  TRACKING ENGINE (.n8n-track/)                │
│  Git-like: branches, commits, diffs, logs     │
│  Context index: file:line → semantic tags     │
├──────────────────────────────────────────────┤
│  N8N FACTORY (6 Departments)                  │
│  Intelligence → Design → Production →         │
│  Compliance → Operations → Records            │
└──────────────────────────────────────────────┘
```

### N8N Factory Pipeline

| # | Department | Duty |
|---|------------|------|
| 1 | **Intelligence** | Research nodes, find doc URLs, verify types |
| 2 | **Design** | Blueprint: node order, connections, positions |
| 3 | **Production** | Build JSON, create credentials, wire everything |
| 4 | **Compliance** | Validate params, creds, connections before deploy |
| 5 | **Operations** | Deploy to n8n API, run test execution |
| 6 | **Records** | Save checkpoint, update tracking, log results |

Compliance failure → back to Production (max 3 retries). After 3 → halt + report.

### Project Safety

```
projects/my-workflow/
├── original/workflow.json     ← NEVER modified (rollback point)
├── draft/workflow.json        ← ALL changes happen here
├── checkpoints/v1.json        ← Confirmed-working versions
├── .env                       ← Secrets (never committed)
└── credentials/cred-map.json  ← Node → credential ID mapping
```

- Original is immutable — always rollback-safe
- `/n8n-publish` auto-checkpoints before pushing
- Credentials created via API from `.env` — secrets never in workflow JSON

### Self-Evolving

The skill updates itself as n8n changes:

```
/n8n-discover          → fetch node types from your n8n instance
/n8n-update-docs       → pull latest params from docs.n8n.io
/n8n-evolve --full     → run both + rebuild context index
```

Node catalog (`docs/nodes/node-catalog.json`) has `doc_url` for every node — agents web-search official docs when local reference is insufficient.

## Cross-Model Design

All commands use a universal instruction format:

```
CONTEXT: 1-line scope
REQUIRES: dependencies
STEPS: numbered, 1 action each
RULES: hard constraints
REFERENCE: file paths
```

- **Small models** (DeepSeek, Haiku): follow steps literally, no ambiguity
- **Large models** (Opus, GPT-5, Sonnet): IF/VERIFY/RULES trigger reasoning chains
- **Token efficient**: most commands 20-40 lines (~200-400 tokens)

## Compatibility

| Platform | How it works |
|----------|-------------|
| **Claude Code** | Plugin format: `.claude-plugin/` + `.claude/commands/`, `.claude/skills/`, `.claude/agents/` |
| **OpenCode** | Auto-installs to `~/.config/opencode/commands/` |
| **Other AI UIs** | Standard `.md` files with YAML frontmatter |
| **MCP** | `.mcp.json` for n8n API + user MCP servers |
| **CLI** | `10x-n8n connect/status/disconnect/config` |

## n8n Requirements

| Setup | Details |
|-------|---------|
| **Cloud** | Any paid plan (Starter+) with API access enabled |
| **Self-hosted** | n8n running locally or on a server, API key generated |
| **API key** | Settings → n8n API → Create API Key |

## Programmatic Usage

```js
import { listWorkflows, createWorkflow, getWorkflow } from '10x-n8n-skill';
import { getConfig } from '10x-n8n-skill/config';
import { initTracker } from '10x-n8n-skill/tracker';
import { fetchLiveNodeTypes } from '10x-n8n-skill/discovery';
```

### API Module

```js
import {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  executeWorkflow,
  listExecutions,
  getExecution,
  stopExecution,
  listCredentials,
  createCredential,
  deleteCredential,
  getCredentialSchema,
  listTags,
  createTag,
  listVariables,
  healthCheck,
} from '10x-n8n-skill';
```

### Tracker Module

```js
import {
  initTracker,
  commitWorkflow,
  getCommitLog,
  logExecution,
  createBranch,
  switchBranch,
  getDiff,
} from '10x-n8n-skill/tracker';
```

### Agents Module

```js
import {
  PIPELINE,
  getAgentRoles,
  getAgentRole,
  getAgentPromptBody,
  buildAgentPrompt,
  createHandoff,
  listHandoffs,
  getPipelineState,
} from '10x-n8n-skill/agents';
```

## File Structure

```
10x-n8n-skill/
├── .claude-plugin/
│   └── plugin.json               ← Plugin manifest
├── .claude/
│   ├── commands/                  ← 41 atomic slash commands
│   │   ├── n8n.md                 ← Help + command list
│   │   ├── n8n-connect.md         ← Connect to n8n
│   │   ├── n8n-new.md             ← Create workflow from NL
│   │   ├── n8n-agent.md           ← N8N Factory pipeline
│   │   └── ... (38 more)
│   ├── skills/                    ← 5 composed workflows
│   │   ├── n8n-factory/SKILL.md   ← Full pipeline
│   │   ├── n8n-lifecycle/SKILL.md ← Guided lifecycle
│   │   ├── n8n-onboard/SKILL.md   ← First-time setup
│   │   ├── n8n-diagnose/SKILL.md  ← Debug workflows
│   │   └── n8n-evolve/SKILL.md    ← Self-update
│   └── agents/                    ← 6 factory department agents
│       ├── intelligence.md        ← Research nodes & intent
│       ├── design.md              ← Design workflow blueprint
│       ├── production.md          ← Build JSON & credentials
│       ├── compliance.md          ← Validate before deploy
│       ├── operations.md          ← Deploy & test execute
│       └── records.md             ← Checkpoint & tracking
├── .mcp.json                      ← MCP server config (n8n + user MCPs)
├── lib/                           ← JavaScript modules
│   ├── api.js                     ← n8n REST API wrapper
│   ├── config.js                  ← Connection config management
│   ├── cli.js                     ← CLI entry point
│   ├── tracker.js                 ← Git-like tracking engine
│   ├── indexer.js                 ← Context index builder
│   ├── agents.js                  ← N8N Factory orchestration
│   ├── discovery.js               ← Dynamic node discovery
│   ├── project.js                 ← Project isolation manager
│   ├── credentials.js             ← Credential mapping + creation
│   └── syncer.js                  ← n8n ↔ local sync
├── docs/                          ← Reference documentation
│   ├── n8n-api-*.md               ← API endpoint docs (9 files)
│   ├── n8n-setup-*.md             ← Installation guides (4 files)
│   ├── n8n-authentication.md      ← Auth reference
│   └── nodes/
│       ├── node-catalog.json      ← Node types, params, creds, doc_urls
│       ├── workflow-patterns.json ← 7 common patterns
│       └── doc-links.json         ← 50+ node → doc URL mappings
├── .n8n-track/                    ← Tracking engine data
│   ├── HEAD.json, branches.json   ← Branch tracking
│   ├── handoffs/                  ← Agent-to-agent task tickets
│   └── index/                     ← Context index
├── projects/                      ← Per-workflow project folders
│   └── .template/README.md
├── scripts/
│   ├── install-commands.js        ← Postinstall: register commands
│   └── uninstall-commands.js      ← Preuninstall: cleanup
├── config/
│   └── n8n-config.example.json
├── ARCHITECTURE.md                ← Full technical architecture
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE                         ← MIT
└── package.json
```

## License

MIT
