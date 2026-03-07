# n8n Setup — Queue Mode & Scaling

## Overview

Queue mode decouples workflow dispatching from execution using a Redis message broker. This enables horizontal scaling with multiple worker processes.

## Architecture

```
┌──────────────┐     ┌─────────┐     ┌──────────────┐
│ Main Instance│────>│  Redis  │────>│   Worker 1   │
│ (dispatcher) │     │ (queue) │     │ (executor)   │
└──────────────┘     └─────────┘     ├──────────────┤
                                      │   Worker 2   │
                                      │ (executor)   │
                                      ├──────────────┤
                                      │   Worker N   │
                                      │ (executor)   │
                                      └──────────────┘
```

### Components

| Component | Role |
|-----------|------|
| **Main Instance** | Handles timers, webhooks, generates execution IDs, enqueues jobs |
| **Redis** | Message broker / job queue |
| **Workers** | Retrieve and process enqueued workflow executions |
| **Webhook Processors** | Optional — dedicated layer for handling webhook requests at scale |

## Requirements

- **Database:** PostgreSQL 13+ (mandatory — SQLite not supported)
- **Message Broker:** Redis
- **Encryption Key:** `N8N_ENCRYPTION_KEY` must be **identical** across main, workers, and webhook processors

## Configuration

### Main Instance

```bash
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=redis-host
QUEUE_BULL_REDIS_PORT=6379
QUEUE_BULL_REDIS_PASSWORD=redis-password
N8N_ENCRYPTION_KEY=shared-encryption-key
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres-host
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=db-password
```

### Worker Process

```bash
# Start a worker
n8n worker

# Or via Docker
docker run -it \
  -e EXECUTIONS_MODE=queue \
  -e QUEUE_BULL_REDIS_HOST=redis-host \
  -e N8N_ENCRYPTION_KEY=shared-encryption-key \
  -e DB_TYPE=postgresdb \
  -e DB_POSTGRESDB_HOST=postgres-host \
  docker.n8n.io/n8nio/n8n worker
```

### Worker Concurrency

```bash
# Set to 5 or higher for optimal performance
QUEUE_WORKER_CONCURRENCY=10
```

## Docker Compose (Queue Mode)

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n-main:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    ports:
      - "5678:5678"
    depends_on:
      - redis
      - postgres

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    command: worker
    environment:
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_WORKER_CONCURRENCY=10
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - redis
      - postgres

volumes:
  redis_data:
  postgres_data:
```

## Scaling

### Horizontal Scaling
- Add more worker containers/processes as load increases
- Each worker independently processes jobs from Redis queue
- Up to 50+ workers tested via Kubernetes deployments

### High Availability
- Run multiple main instances with transparent leadership election
- If primary main fails, another takes over

### Webhook Processors
- Add dedicated webhook processor instances for high-throughput webhook scenarios
- Offloads webhook handling from the main instance

## Key Considerations

1. **Encryption key consistency** — All instances MUST share the same `N8N_ENCRYPTION_KEY`
2. **Database access** — All instances connect to the same PostgreSQL database
3. **Redis availability** — If Redis goes down, job queuing stops
4. **Worker concurrency** — Set to 5+ for production workloads
5. **Monitoring** — Monitor Redis queue depth and worker health

## Reference

- https://docs.n8n.io/hosting/scaling/queue-mode/
