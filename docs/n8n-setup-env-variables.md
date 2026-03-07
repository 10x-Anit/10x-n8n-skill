# n8n Setup — Environment Variables

## Overview

n8n is configured primarily through environment variables. These control deployment settings, database connections, security, logging, and feature behavior.

**Important:** Append `_FILE` to any variable to load its value from a file (useful for Docker/Kubernetes secrets).

## Deployment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_HOST` | Hostname for the n8n instance | `localhost` |
| `N8N_PORT` | Port to run n8n on | `5678` |
| `N8N_PROTOCOL` | Protocol (http/https) — affects generated URLs | `http` |
| `N8N_ENCRYPTION_KEY` | Key used to encrypt credentials in database | Auto-generated |
| `WEBHOOK_URL` | Public URL for webhooks (behind reverse proxy) | Auto-detected |
| `N8N_EDITOR_BASE_URL` | Base URL for the editor UI | Same as webhook URL |
| `VUE_APP_URL_BASE_API` | API base URL for frontend | `/` |

## Database Variables

### SQLite (Default)

No additional config needed. Database stored at `~/.n8n/database.sqlite`.

### PostgreSQL

| Variable | Description | Default |
|----------|------------|---------|
| `DB_TYPE` | Set to `postgresdb` | `sqlite` |
| `DB_POSTGRESDB_HOST` | PostgreSQL host | `localhost` |
| `DB_POSTGRESDB_PORT` | PostgreSQL port | `5432` |
| `DB_POSTGRESDB_DATABASE` | Database name | `n8n` |
| `DB_POSTGRESDB_USER` | Database user | `root` |
| `DB_POSTGRESDB_PASSWORD` | Database password | — |
| `DB_POSTGRESDB_SCHEMA` | Schema name | `public` |
| `DB_POSTGRESDB_SSL_ENABLED` | Enable SSL | `false` |

## Security & Access Control

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_BASIC_AUTH_ACTIVE` | Enable basic auth | `false` |
| `N8N_BASIC_AUTH_USER` | Basic auth username | — |
| `N8N_BASIC_AUTH_PASSWORD` | Basic auth password | — |

## Timezone

| Variable | Description | Default |
|----------|------------|---------|
| `GENERIC_TIMEZONE` | Timezone for schedule-based nodes | `America/New_York` |
| `TZ` | System timezone | — |

## Workflow Configuration

| Variable | Description | Default |
|----------|------------|---------|
| `WORKFLOWS_DEFAULT_NAME` | Default name for new workflows | `My workflow` |
| `N8N_ONBOARDING_FLOW_DISABLED` | Disable onboarding flow | `false` |
| `N8N_WORKFLOW_TAGS_DISABLED` | Disable workflow tags | `false` |
| `N8N_WORKFLOW_CALLER_POLICY_DEFAULT_OPTION` | Default caller policy | `workflowsFromSameOwner` |

## Execution Settings

| Variable | Description | Default |
|----------|------------|---------|
| `EXECUTIONS_MODE` | `regular` or `queue` | `regular` |
| `EXECUTIONS_TIMEOUT` | Max execution time (seconds) | `-1` (no limit) |
| `EXECUTIONS_TIMEOUT_MAX` | Max configurable timeout | — |
| `EXECUTIONS_DATA_SAVE_ON_ERROR` | Save data on error | `all` |
| `EXECUTIONS_DATA_SAVE_ON_SUCCESS` | Save data on success | `all` |
| `EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS` | Save manual execution data | `true` |
| `EXECUTIONS_DATA_MAX_AGE` | Auto-delete executions older than (hours) | `336` (14 days) |

## Logging

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_LOG_LEVEL` | Log level: `info`, `warn`, `error`, `debug` | `info` |
| `N8N_LOG_OUTPUT` | Log output: `console`, `file` | `console` |
| `N8N_LOG_FILE_LOCATION` | Log file path | `~/.n8n/logs/n8n.log` |

## Node Configuration

| Variable | Description | Default |
|----------|------------|---------|
| `NODES_INCLUDE` | Comma-separated list of nodes to load | All |
| `NODES_EXCLUDE` | Comma-separated list of nodes to exclude | None |
| `NODE_FUNCTION_ALLOW_EXTERNAL` | Allow external modules in Code node | — |
| `N8N_COMMUNITY_PACKAGES_ENABLED` | Enable community node packages | `true` |

## Queue Mode Variables

| Variable | Description | Default |
|----------|------------|---------|
| `EXECUTIONS_MODE` | Set to `queue` | `regular` |
| `QUEUE_BULL_REDIS_HOST` | Redis host | `localhost` |
| `QUEUE_BULL_REDIS_PORT` | Redis port | `6379` |
| `QUEUE_BULL_REDIS_PASSWORD` | Redis password | — |
| `QUEUE_BULL_REDIS_DB` | Redis database number | `0` |

## Binary Data

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_DEFAULT_BINARY_DATA_MODE` | `default` (memory) or `filesystem` | `default` |
| `N8N_BINARY_DATA_STORAGE_PATH` | Path for binary file storage | `~/.n8n/binaryData` |

## Endpoints

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_PAYLOAD_SIZE_MAX` | Max payload size in MB | `16` |
| `N8N_METRICS` | Enable Prometheus metrics endpoint | `false` |
| `N8N_METRICS_PREFIX` | Prefix for metrics | `n8n_` |

## Reference

- https://docs.n8n.io/hosting/configuration/environment-variables/
