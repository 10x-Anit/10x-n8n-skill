# n8n Setup — Docker

## Overview

Docker is the recommended approach for self-hosting n8n. It provides a clean, isolated environment and avoids OS/tooling incompatibilities.

## Prerequisites

- Docker installed ([docs.docker.com](https://docs.docker.com/get-docker/))
- Docker Compose (included with Docker Desktop)
- Minimum 2 GB RAM, 2 CPU cores

## Quick Start (Single Container)

### Step 1: Create a persistent volume

```bash
docker volume create n8n_data
```

### Step 2: Run n8n

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Access at: **http://localhost:5678**

## Docker Compose (Production Setup)

### Basic docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### Production docker-compose.yml (with Traefik + PostgreSQL)

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    restart: always
    command:
      - "--api=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.mytlschallenge.acme.tlschallenge=true"
      - "--certificatesresolvers.mytlschallenge.acme.email=${SSL_EMAIL}"
      - "--certificatesresolvers.mytlschallenge.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - traefik_data:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro

  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    environment:
      - N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${SUBDOMAIN}.${DOMAIN_NAME}`)
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.tls.certresolver=mytlschallenge
      - traefik.http.services.n8n.loadbalancer.server.port=5678
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

volumes:
  traefik_data:
  postgres_data:
  n8n_data:
```

### Production .env file

```bash
DOMAIN_NAME=yourdomain.com
SUBDOMAIN=n8n
GENERIC_TIMEZONE=UTC
SSL_EMAIL=admin@yourdomain.com
DB_PASSWORD=your-secure-password
```

## Running Commands

```bash
# Start in background
docker compose up -d

# View logs
docker compose logs -f n8n

# Stop
docker compose down

# Update n8n
docker compose pull
docker compose up -d
```

## Data Persistence

**Critical:** Always mount a volume for `/home/node/.n8n` to persist:
- Workflows
- Credentials (encrypted)
- Execution history
- SQLite database (if using SQLite)
- Encryption key

## Sensitive Data with Docker Secrets

Append `_FILE` to any environment variable to load from a file:

```yaml
environment:
  - DB_POSTGRESDB_PASSWORD_FILE=/run/secrets/db_password
secrets:
  db_password:
    file: ./db_password.txt
```

## Docker Image

- **Registry:** `docker.n8n.io/n8nio/n8n`
- **Docker Hub:** `n8nio/n8n`
- Tags: `latest`, specific versions like `1.30.0`

## Reference

- https://docs.n8n.io/hosting/installation/docker/
- https://docs.n8n.io/hosting/installation/server-setups/docker-compose/
