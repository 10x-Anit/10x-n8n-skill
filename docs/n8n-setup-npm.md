# n8n Setup — npm

## Overview

n8n can be installed globally via npm for quick local development and testing.

## Prerequisites

- **Node.js:** Version 18.x, 20.x, or 22.x (22.16+ for development)
- **npm:** Included with Node.js

## Installation

```bash
npm install -g n8n
```

## Starting n8n

```bash
n8n start
```

Or simply:

```bash
n8n
```

Access at: **http://localhost:5678**

## First Run

On first launch:
1. n8n creates the data directory at `~/.n8n/`
2. Generates an encryption key for credentials
3. Creates a SQLite database
4. Prompts you to create an admin account in the browser

## CLI Commands

| Command | Description |
|---------|-------------|
| `n8n start` | Start n8n instance |
| `n8n start --tunnel` | Start with tunnel for webhook testing |
| `n8n export:workflow --all` | Export all workflows to JSON |
| `n8n export:workflow --id=<id>` | Export specific workflow |
| `n8n export:credentials --all` | Export all credentials |
| `n8n import:workflow --input=<file>` | Import workflow from JSON |
| `n8n import:credentials --input=<file>` | Import credentials from JSON |

## Environment Variables

Set before starting n8n:

```bash
# Change port
export N8N_PORT=5679

# Set encryption key (important for credential security)
export N8N_ENCRYPTION_KEY=your-secret-key

# Set timezone
export GENERIC_TIMEZONE=Asia/Kolkata

# Enable basic auth
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=password
```

## Data Directory

Default: `~/.n8n/`

Contains:
- `database.sqlite` — Workflow and credential storage
- `config` — Instance configuration
- Encryption key

## Updating

```bash
npm update -g n8n
```

## When to Use npm vs Docker

| npm | Docker |
|-----|--------|
| Quick local testing | Production deployments |
| Development/debugging | Team environments |
| Single-user scenarios | Need PostgreSQL |
| Temporary setups | Persistent hosting |

## Limitations

- Uses SQLite by default (single-writer limitation)
- No built-in process management (use pm2 or systemd for persistence)
- Manual environment variable management
- No built-in reverse proxy or SSL

## Running with pm2 (Process Manager)

```bash
# Install pm2
npm install -g pm2

# Start n8n with pm2
pm2 start n8n

# Auto-start on boot
pm2 startup
pm2 save
```

## Reference

- https://docs.n8n.io/hosting/installation/npm/
- https://docs.n8n.io/hosting/cli-commands/
