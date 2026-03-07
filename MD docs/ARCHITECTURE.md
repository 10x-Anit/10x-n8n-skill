# 10x-n8n-skill — Architecture

## Overview

A Claude Code skill that manages n8n workflows as an n8n expert acting on behalf of the user. Every workflow is an isolated project with versioned safety, credential management via env vars, and a multi-agent swarm for intelligent automation — all tracked locally in a Git-like system with token-efficient context indexing.

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: PROJECT ISOLATION                             │
│  projects/<slug>/  — 1 folder per workflow              │
│  original → draft → checkpoint → publish lifecycle      │
│  .env for secrets, cred-map for credential references   │
├─────────────────────────────────────────────────────────┤
│  Layer 2: TRACKING ENGINE (.n8n-track/)                 │
│  Git-like: branches, commits, diffs, execution logs     │
│  Context index: file:line → semantic tags               │
├─────────────────────────────────────────────────────────┤
│  Layer 3: N8N FACTORY (6 Departments)                    │
│  Intelligence → Design → Production → Compliance        │
│  → Operations → Records                                 │
│  Handoff tickets with exact context references          │
│  Token budgets for small model compatibility            │
└─────────────────────────────────────────────────────────┘
```

## Layer 1: Project Isolation

Each workflow is a self-contained project folder:

```
projects/<workflow-slug>/
├── meta.json              ← ID, name, status, version, timestamps
├── .env                   ← User's secrets (API keys, tokens) — NEVER committed
├── env.schema.json        ← What env vars are needed + descriptions
├── original/
│   └── workflow.json      ← EXACT copy from n8n at import time. NEVER modified.
├── draft/
│   └── workflow.json      ← Working copy. ALL modifications happen here.
├── checkpoints/
│   ├── v1.json            ← Confirmed-working version after first publish
│   ├── v2.json            ← After second change cycle
│   └── v3.json            ← Latest confirmed-working version
├── credentials/
│   └── cred-map.json      ← Maps: node → credential type → env var → n8n cred ID
└── history.jsonl          ← Local change log (1 line per event)
```

### Workflow Lifecycle

```
User describes workflow (natural language)
        │
        ▼
  ┌─────────────┐     ┌──────────────┐
  │  /n8n-new    │ or  │  /n8n-import  │
  │  (from NL)   │     │  (from n8n)   │
  └──────┬──────┘     └──────┬───────┘
         │                    │
         ▼                    ▼
    Create project folder + save as original/workflow.json
    Copy to draft/workflow.json
    Analyze credential needs → write env.schema.json
    Ask user for env vars → save to .env
    Create credentials in n8n via API → save IDs to cred-map.json
         │
         ▼
  ┌─────────────┐
  │  /n8n-modify │ ← User requests changes (natural language)
  │  (draft only)│   AI reads node catalog, makes precise changes
  └──────┬──────┘
         │
         ▼
  ┌──────────────┐
  │  /n8n-execute │ ← Test the workflow
  └──────┬───────┘
         │
    ┌────┴────┐
    │ Working? │
    ├─YES─────┤
    │         ▼
    │  ┌──────────────┐
    │  │ /n8n-checkpoint │ ← Save as vN
    │  └──────┬───────┘
    │         ▼
    │  ┌─────────────┐
    │  │ /n8n-publish  │ ← Push to n8n API (auto-checkpoints first)
    │  └──────┬──────┘    Updates original/ to match published state
    │         ▼
    │    LIVE on n8n
    │
    ├─NO──────┐
    │         ▼
    │  ┌──────────────┐
    │  │ /n8n-modify   │ ← Fix the issue
    │  └──────────────┘
    │
    │  OR
    │
    │  ┌──────────────┐
    │  │ /n8n-rollback │ ← Restore any checkpoint or original
    │  └──────────────┘
    └─────────┘
```

### Safety Rules

1. `original/workflow.json` is **NEVER modified** — it's the ultimate rollback point
2. All changes happen in `draft/workflow.json` only
3. `/n8n-publish` auto-creates a checkpoint before pushing — you can always go back
4. The published version becomes the new original (new baseline for future changes)
5. Credentials are created via API using env vars — secrets stay in `.env`, never in workflow JSON

## Layer 2: Tracking Engine

```
.n8n-track/
├── HEAD.json              ← Current branch + instance pointer
├── branches.json          ← Workflow = branch mapping
├── commits.jsonl          ← 1-line-per-commit (append-only)
├── executions.jsonl       ← 1-line-per-execution (append-only)
├── refs/workflows/        ← Latest compact ref per workflow
├── snapshots/             ← Full workflow JSON at each commit
├── diffs/                 ← Semantic diffs (nodes added/removed/modified)
├── handoffs/              ← Agent-to-agent task tickets
└── index/
    ├── context-map.json   ← Inverted index: tag → file:line ranges
    └── line-index.json    ← Forward index: file:line → semantic tags
```

### Record Formats (1 line = 1 record)

**Commit:**
```
{"h":"abc123","ts":"2024-01-15T10:30:00Z","wf":"42","br":"workflow-42","msg":"add Slack node","parent":"def456"}
```

**Execution:**
```
{"id":"789","wf":"42","ts":"2024-01-15T10:35:00Z","status":"success","dur_ms":5200,"trigger":"webhook","error":null}
```

**History (per-project):**
```
{"ts":"...","action":"modified","msg":"added Slack notification node"}
{"ts":"...","action":"checkpoint","msg":"v2: working with Slack alerts","version":2}
{"ts":"...","action":"published","msg":"Published to n8n (workflow ID: 42)"}
```

### Context Index

Maps every section in the codebase to semantic tags with exact line numbers:

```json
{
  "docs/n8n-api-workflows.md:15-28": ["api", "workflow", "create", "POST"],
  "docs/nodes/node-catalog.json:5-20": ["webhook", "trigger", "params"],
  "projects/alert-pipeline/draft/workflow.json:10-25": ["slack", "notification", "node"]
}
```

**How agents use it:**
1. Agent needs info on "creating a workflow with Slack"
2. Query: `["workflow", "create", "slack"]`
3. Gets back: `docs/n8n-api-workflows.md:15-28` and `docs/nodes/node-catalog.json:80-95`
4. Reads ONLY those line ranges. Never full files.

## Layer 3: N8N Factory (6 Departments)

### The Pipeline

```
Intelligence → Design → Production → Compliance → Operations → Records
```

### Departments

| # | Department | Duty | Token Budget |
|---|------------|------|-------------|
| 1 | **Intelligence Dept** | Research nodes, check docs.n8n.io, find credential types | 800 |
| 2 | **Design Dept** | Design workflow blueprint, connections, positions | 1000 |
| 3 | **Production Dept** | Build JSON, create credentials from .env, wire everything | 1500 |
| 4 | **Compliance Dept** | Validate all params, creds, connections before deploy | 800 |
| 5 | **Operations Dept** | Deploy to n8n API, run test execution, capture result | 800 |
| 6 | **Records Dept** | Save checkpoint, update tracking, log everything | 600 |

### Failure Routing

- Compliance fails → sends back to Production with exact error
- Operations execution fails → Records diagnoses → sends to Production
- After 3 retries → halt and report to user

### Handoff Protocol

Departments pass work to each other via JSON tickets in `handoffs/`:

```json
{
  "id": "ho-1705312200-intelligence-to-design",
  "from": "intelligence",
  "to": "design",
  "task": "Design blueprint for webhook → code → Slack workflow",
  "context_refs": ["docs/nodes/node-catalog.json:147-159", "docs/nodes/workflow-patterns.json:4-10"],
  "validation_report": { "nodes_verified": 3, "doc_urls_confirmed": 3, "credentials_needed": ["slackApi"] },
  "payload": { "workflow_name": "Alert Pipeline", "nodes_needed": ["webhook", "code", "slack"] }
}
```

Each department reads ONLY the `context_refs` lines. This is what makes it work with small models.

## Env & Credential Flow

```
User provides secrets → .env file (local only)
        │
        ▼
Skill reads .env → creates credentials in n8n via API
        │
        ▼
n8n returns credential IDs → saved to cred-map.json
        │
        ▼
Workflow nodes reference credential IDs (not raw secrets)
```

The `.env` file maps to the `docs/nodes/node-catalog.json` which knows:
- Each node type's credential type
- Which env var names hold which credential fields
- Example: Slack node → `slackApi` credential → `SLACK_BOT_TOKEN` env var → `accessToken` field

## Node Catalog

`docs/nodes/node-catalog.json` prevents AI mistakes by documenting:
- Exact node `type` strings (e.g., `n8n-nodes-base.slack`, not "Slack")
- Required parameters with types and valid values
- Credential types and env var mappings
- Connection rules (triggers must be first, IF has 2 outputs, etc.)
- Position grid spacing for clean canvas layout

`docs/nodes/workflow-patterns.json` provides templates:
- webhook-to-action, schedule-to-report, webhook-branch-merge
- data-sync, ai-agent, batch-processing, error-handler

## Plugin Structure (Official Claude Code Format)

```
10x-n8n-skill/
├── .claude-plugin/plugin.json    ← Plugin manifest
├── .claude/
│   ├── commands/                 ← 41 atomic operations (.md files)
│   │   └── n8n-*.md               Works with: Claude Code, OpenCode, any AI UI
│   ├── skills/                   ← 5 composed workflows (SKILL.md)
│   │   ├── n8n-factory/           Full 6-dept pipeline
│   │   ├── n8n-lifecycle/         Create→modify→test→publish cycle
│   │   ├── n8n-onboard/           First-time setup guide
│   │   ├── n8n-diagnose/          Debug & troubleshoot workflows
│   │   └── n8n-evolve/            Self-update catalog + docs
│   └── agents/                   ← 6 factory department agents (.md files)
│       ├── intelligence.md        Research nodes & intent
│       ├── design.md              Design workflow blueprint
│       ├── production.md          Build JSON & credentials
│       ├── compliance.md          Validate before deploy
│       ├── operations.md          Deploy & test execute
│       └── records.md             Checkpoint & tracking
├── .mcp.json                     ← MCP server config (n8n API + user MCPs)
├── lib/                          ← JS modules (API, tracking, agents, etc.)
├── docs/                         ← Reference files (API docs, node catalog)
├── .n8n-track/                   ← Tracking engine data
└── projects/                     ← Per-workflow project folders
```

### Agent Format (.claude/agents/*.md)

Each department agent is a standard Claude Code agent file with YAML frontmatter:

```yaml
---
name: intelligence
description: "Research n8n nodes for a task..."
tools: Read, Glob, Grep, WebFetch, WebSearch
model: sonnet
maxTurns: 10
---
ROLE: Intelligence Dept
DUTY: Understand user intent...
SINGLE TASK: RESEARCH what nodes and connections are needed
READ THESE FILES: [exact paths]
OUTPUT: [handoff ticket path]
AUDIT BEFORE HANDOFF: [checklist]
HANDS OFF TO: design
BUDGET: 800 tokens
RULES: [constraints]
```

### Commands vs Skills vs Agents

**Commands** = atomic single-purpose operations. 1 command = 1 action.
**Skills** = intelligent compositions that chain multiple commands together.
**Agents** = autonomous subagents with their own context, tools, and token budgets.

No duplication — skills compose commands, agents orchestrate the pipeline.

### MCP Configuration (.mcp.json)

Users can add MCP servers for n8n and other services at the project root:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["lib/mcp-bridge.js"],
      "env": { "N8N_BASE_URL": "http://localhost:5678", "N8N_API_KEY": "" }
    }
  }
}
```

## Universal Instruction Format

All commands use a cross-model format that works from DeepSeek to GPT-5.3 to Opus:

```
CONTEXT: 1-line scope
REQUIRES: dependencies
STEPS: numbered, 1 action each
RULES: hard constraints
REFERENCE: file paths
```

- Small models follow steps literally — no ambiguity
- Large models use IF/VERIFY/RULES as reasoning triggers
- Token efficient: most commands 20-40 lines (~200-400 tokens)

## Command Map (41 commands + 5 skills + 6 agents)

### Atomic Commands (.claude/commands/)

**Setup:** `/n8n`, `/n8n-connect`, `/n8n-disconnect`, `/n8n-status`, `/n8n-setup`
**Lifecycle:** `/n8n-new`, `/n8n-import`, `/n8n-modify`, `/n8n-checkpoint`, `/n8n-publish`, `/n8n-rollback`, `/n8n-projects`
**Credentials:** `/n8n-env`, `/n8n-cred-setup`
**API:** `/n8n-workflows`, `/n8n-workflow`, `/n8n-execute`, `/n8n-executions`, `/n8n-execution`, `/n8n-credentials`, `/n8n-credential`, `/n8n-tags`, `/n8n-variables`, `/n8n-webhooks`, `/n8n-export`
**Tracking:** `/n8n-init`, `/n8n-sync`, `/n8n-commit`, `/n8n-diff`, `/n8n-log`, `/n8n-branch`, `/n8n-checkout`, `/n8n-track-status`, `/n8n-run-log`
**Factory:** `/n8n-agent`, `/n8n-agent-status`, `/n8n-handoff`, `/n8n-context`, `/n8n-reindex`, `/n8n-discover`, `/n8n-update-docs`

### Composed Skills (.claude/skills/)

| Skill | Chains | Purpose |
|-------|--------|---------|
| `/n8n-factory` | agent + new + cred-setup + publish | Full 6-dept pipeline from NL to deployed workflow |
| `/n8n-lifecycle` | new/import + modify + execute + checkpoint + publish | Guided lifecycle management |
| `/n8n-onboard` | setup + connect + init + sync + new | First-time user setup |
| `/n8n-diagnose` | status + execution + run-log + diff + catalog | Debug failing workflows |
| `/n8n-evolve` | discover + update-docs + reindex | Self-update skill references |

## Design Principles

1. **No duplication** — Commands are atomic, skills compose them. No repeated content.
2. **Universal format** — Works across Claude Code, OpenCode, and other AI UIs.
3. **Cross-model** — Concise for small models, structured for large model reasoning.
4. **Safety first** — Original never modified. Auto-checkpoint before publish.
5. **Zero manual intervention** — Everything via API. Credentials from env.
6. **1 line = 1 record** — JSONL for commits, executions, history.
7. **Load only what's needed** — Context index maps topics to exact line ranges.
8. **Node catalog prevents mistakes** — AI always checks catalog before modifying nodes.
9. **Self-evolving** — /n8n-discover + /n8n-update-docs keep the skill current with n8n updates.
