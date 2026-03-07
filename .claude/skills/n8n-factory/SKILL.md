---
description: "N8N Factory — builds production-ready workflows from natural language using Python sandbox"
argument-hint: "<describe what your workflow should do>"
allowed-tools: "Read, Write, Bash(python *), Bash(curl *), Grep, Glob, WebFetch, WebSearch"
---

CONTEXT: 10x.in N8N Factory — Build a complete n8n workflow from natural language. Uses Python sandbox for ALL node lookups, JSON building, and validation. 546+ nodes indexed from n8n source repo — zero hallucination.

REQUIRES: ~/.claude/n8n-config.json

## CORE PRINCIPLE: PROGRAMMATIC-FIRST

NEVER assume or hallucinate node types, versions, or parameters. ALWAYS use sandbox commands to verify:
- `engine.py find` — get exact type + version from source-extracted index (546 nodes)
- `engine.py search` — find nodes by keyword when you don't know the exact key
- `engine.py detail` — read actual TypeScript source for detailed parameters
- `engine.py grep` — search n8n source files for specific patterns
- `engine.py ls` — list files in a node's source directory

When information is missing: DOWNLOAD the source, don't guess. If a node isn't in the index, use `engine.py extract` to re-scan the source repo.

## PIPELINE: Intelligence -> Design -> Production -> Compliance -> Operations -> Records

## STEPS

### 1. VERIFY CONNECTION
Read ~/.claude/n8n-config.json | IF missing -> tell user: `/n8n-connect` first

### 2. PARSE — Extract what workflow does, triggers, services, output expected

### 3. INTELLIGENCE — Research nodes
```bash
# Check if we built something similar before
python sandbox/engine.py recall "wf:<similar-name>"

# Find exact nodes needed (from 546-node source index)
python sandbox/engine.py find webhook,httpRequest,code,slack,if

# Search by keyword if unsure about exact name
python sandbox/engine.py search "email"

# Get detailed params from TypeScript source
python sandbox/engine.py detail slack

# Grep source for specific patterns
python sandbox/engine.py grep "operation.*send" slack

# List files in a node's source dir
python sandbox/engine.py ls slack

# List all available nodes
python sandbox/engine.py list

# Stats
python sandbox/engine.py stats
```
If node not in index -> `engine.py search` first, then web search `site:docs.n8n.io` as fallback

### 4. DESIGN — Blueprint
```bash
# Get rules (connection format, positions, settings)
python sandbox/engine.py rules

# Get matching template for reference
python sandbox/engine.py template webhook
```
- Decide trigger, node chain, positions, connections
- Map IF/Switch branching

### 5. PRODUCTION — Build
```bash
# Create project folder
mkdir -p projects/<slug>/{original,draft,checkpoints,credentials}

# Create spec.json with node specs + connections
# Then build:
python sandbox/engine.py build projects/<slug>/spec.json projects/<slug>/draft/workflow.json
```

The builder handles: type resolution from source index, typeVersion, UUIDs, grid positions, settings, validation.

### 6. CREDENTIALS (if needed)
- Detect from `find` output which nodes need credentials
- Write env.schema.json + .env template
- ASK user for secret values -> WAIT
- POST /api/v1/credentials -> save IDs to cred-map.json
- Update spec.json with credential IDs -> rebuild

### 7. COMPLIANCE — Validate
```bash
python sandbox/engine.py validate projects/<slug>/draft/workflow.json
```
If FAIL -> fix spec -> rebuild. Max 3 retries.

### 8. OPERATIONS — Deploy
```bash
# Create
curl -s -X POST "$baseUrl/api/v1/workflows" -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" -d @projects/<slug>/draft/workflow.json

# Or update (PATCH, not PUT)
curl -s -X PATCH "$baseUrl/api/v1/workflows/$id" -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" -d @projects/<slug>/draft/workflow.json

# Activate (no separate endpoint)
curl -s -X PATCH "$baseUrl/api/v1/workflows/$id" -H "X-N8N-API-KEY: $apiKey" -H "Content-Type: application/json" -d '{"active":true}'
```

### 9. RECORDS — Archive
- Copy draft -> original/workflow.json
- Save checkpoint v1
- Update meta.json
- Append to history.jsonl + .n8n-track/commits.jsonl

## OUTPUT
```
N8N Factory — COMPLETE
  Workflow: "<name>" | ID: <id> | Nodes: <count>
  Project: projects/<slug>/ | Checkpoint: v1
  [INTELLIGENCE] Nodes found via source index
  [PRODUCTION]   JSON built programmatically
  [COMPLIANCE]   Validated
  [OPERATIONS]   Deployed
Next: /n8n-modify <slug> <changes>
```

## RULES
- ALWAYS use `python sandbox/engine.py` — never read catalog/template files directly
- NEVER assume typeVersion — always verify via `engine.py find` (sourced from actual n8n repo)
- `engine.py find` for lookups, `engine.py build` for JSON, `engine.py validate` for checks
- `engine.py search/detail/grep/ls` for exploration when you need more info
- `engine.py recall` to reuse past successful approaches — skill evolves with use
- Use PATCH not PUT for updates
- No /activate endpoint — use PATCH { "active": true }
- Secrets stay in .env — never in workflow JSON
- When something is missing: DOWNLOAD and verify, don't guess

$ARGUMENTS
