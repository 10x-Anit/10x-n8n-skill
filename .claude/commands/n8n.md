---
description: "Show n8n skill commands and connection status"
argument-hint: ""
---

CONTEXT: Display all available commands and current connection state.

STEPS:
1. PRINT: `10x.in n8n Skill`
2. READ ~/.claude/n8n-config.json
3. IF exists → show: `Connected: <mode> @ <baseUrl>`
4. IF missing → show: `Not connected. Run /n8n-connect`
5. COUNT folders in projects/ → show project count
6. OUTPUT command table below

## Commands

### Setup
| Command | Action |
|---------|--------|
| `/n8n-connect` | Connect to n8n instance |
| `/n8n-disconnect` | Remove connection |
| `/n8n-status` | Health check |
| `/n8n-setup` | Install n8n locally |

### Workflow Lifecycle
| Command | Action |
|---------|--------|
| `/n8n-new <desc>` | Create workflow from natural language |
| `/n8n-import <id>` | Import existing workflow |
| `/n8n-modify <slug> <changes>` | Modify draft safely |
| `/n8n-checkpoint <slug>` | Save working version |
| `/n8n-publish <slug>` | Push to n8n |
| `/n8n-rollback <slug> [v]` | Restore version |
| `/n8n-projects` | List projects |

### Credentials
| Command | Action |
|---------|--------|
| `/n8n-env <slug>` | Manage env vars |
| `/n8n-cred-setup <slug>` | Create creds from env |

### API Operations
| Command | Action |
|---------|--------|
| `/n8n-workflows` | List workflows |
| `/n8n-workflow <action> [id]` | CRUD workflow |
| `/n8n-execute <id>` | Run workflow |
| `/n8n-executions` | List executions |
| `/n8n-credentials` | List credentials |
| `/n8n-tags` | Manage tags |
| `/n8n-export <id>` | Export as JSON |

### Tracking
| Command | Action |
|---------|--------|
| `/n8n-init` | Initialize tracker |
| `/n8n-sync` | Pull from n8n |
| `/n8n-commit <id> <msg>` | Snapshot |
| `/n8n-diff <id>` | Show changes |
| `/n8n-log` | History |

### N8N Factory
| Command | Action |
|---------|--------|
| `/n8n-agent <task>` | Dispatch to factory pipeline |
| `/n8n-agent-status` | Factory department status |
| `/n8n-discover` | Fetch node types from instance |

## Quick Start
1. `/n8n-connect` → connect
2. `/n8n-new <describe workflow>` → create
3. `/n8n-publish <slug>` → deploy

$ARGUMENTS
