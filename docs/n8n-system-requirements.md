# n8n System Requirements

## Minimum Specifications

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB SSD | 40+ GB SSD |
| **OS** | Any Linux | Ubuntu 24.04 LTS |
| **Node.js** | 18.x | 22.x |

**Note:** 1 core / 1 GB RAM is technically possible but risks memory errors under load. Not recommended.

## Node.js Version Support

| Version | Status |
|---------|--------|
| 18.x | Supported |
| 20.x | Supported |
| 22.x | Supported (recommended) |
| 22.16+ | Required for n8n development |

## Docker Requirements

- Docker Engine 20.10+
- Docker Compose v2+
- Docker Desktop (for Windows/macOS development)

## Database Requirements

### SQLite (Default)
- No additional requirements
- Disk space for database file (~100 MB typical)

### PostgreSQL (Production)
- PostgreSQL 13+ (required for queue mode)
- PostgreSQL 16 recommended
- Separate server or container

### Redis (Queue Mode Only)
- Redis 6+
- Required only for queue mode scaling

## Network Requirements

| Port | Service | Required |
|------|---------|----------|
| 5678 | n8n web UI + API | Yes |
| 80 | HTTP (reverse proxy) | Production |
| 443 | HTTPS (reverse proxy) | Production |
| 5432 | PostgreSQL | If using PostgreSQL |
| 6379 | Redis | If using queue mode |

## Cloud/VPS Provider Recommendations

For self-hosting, any provider works. Common choices:

| Provider | Smallest Viable Plan |
|----------|---------------------|
| DigitalOcean | Basic Droplet (2 GB RAM) |
| Hetzner | CX22 (2 vCPU, 4 GB RAM) |
| AWS | t3.small (2 vCPU, 2 GB RAM) |
| Google Cloud | e2-small (2 vCPU, 2 GB RAM) |
| Azure | B1ms (1 vCPU, 2 GB RAM) |
| Linode | Linode 2 GB |
| Vultr | Cloud Compute 2 GB |

## Storage Considerations

- **Workflows:** Minimal storage (KB per workflow)
- **Executions:** Can grow significantly — configure auto-pruning
- **Binary data:** Can consume significant space if workflows handle files
- **Database:** PostgreSQL WAL can grow — configure archiving
- **Logs:** Configure rotation to prevent disk fill

## Scaling Considerations

### Single Instance
- Handles most use cases
- Up to ~100 concurrent workflows
- SQLite or PostgreSQL

### Queue Mode (Multiple Workers)
- PostgreSQL 13+ required
- Redis required
- Each worker: 1-2 GB RAM
- Scale to 50+ workers

### Memory Usage Patterns
- n8n is not CPU-intensive
- Memory is the primary constraint
- Large payloads and binary data increase memory usage
- Set `EXECUTIONS_DATA_MAX_AGE` to auto-prune old executions

## Windows Development

For local development on Windows:
- Use Docker Desktop with WSL2 backend
- Or install Node.js natively and use npm
- Performance best with WSL2

## Reference

- https://docs.n8n.io/hosting/
- https://docs.n8n.io/hosting/installation/docker/
- https://docs.n8n.io/hosting/scaling/queue-mode/
