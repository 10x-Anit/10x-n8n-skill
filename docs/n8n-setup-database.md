# n8n Setup — Database Options

## Overview

n8n supports two database backends. The choice affects performance, scalability, and concurrent access.

## SQLite (Default)

### Characteristics
- **Type:** File-based, embedded database
- **Location:** `~/.n8n/database.sqlite`
- **Setup:** Zero configuration — works out of the box
- **Locking:** File-level locking (single writer at a time)

### Best For
- Development and testing
- Single-user scenarios
- Quick local setups
- Low-traffic instances

### Limitations
- Cannot handle concurrent writes efficiently
- Not suitable for queue mode
- Not recommended for production with multiple users
- File-level locking can cause contention

## PostgreSQL (Recommended for Production)

### Characteristics
- **Type:** Client-server relational database
- **Minimum Version:** PostgreSQL 13+ (required for queue mode)
- **Locking:** Row-level locking (parallel writes)
- **Connection:** TCP connection to separate service

### Best For
- Production deployments
- Multi-user environments
- Queue mode (required)
- High-traffic instances
- Team/enterprise setups

### Configuration

```bash
# Environment variables
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your-password
DB_POSTGRESDB_SCHEMA=public
```

### Docker Compose Example

```yaml
services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: secure-password
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    image: docker.n8n.io/n8nio/n8n
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=secure-password
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### SSL Connection

```bash
DB_POSTGRESDB_SSL_ENABLED=true
DB_POSTGRESDB_SSL_CA=/path/to/ca-cert.pem
DB_POSTGRESDB_SSL_CERT=/path/to/client-cert.pem
DB_POSTGRESDB_SSL_KEY=/path/to/client-key.pem
```

## Deprecated Databases

- **MySQL** — Deprecated as of n8n v1.0, no longer supported
- **MariaDB** — Deprecated as of n8n v1.0, no longer supported

## Comparison Table

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Setup complexity | None | Moderate |
| Concurrent writes | No (file lock) | Yes (row lock) |
| Queue mode support | No | Yes (required) |
| Scaling | Single instance | Multi-instance |
| Backup | Copy file | pg_dump |
| Production ready | No | Yes |
| External service | No | Yes |

## Migration: SQLite to PostgreSQL

1. Export all workflows: `n8n export:workflow --all --output=workflows.json`
2. Export all credentials: `n8n export:credentials --all --output=credentials.json`
3. Set up PostgreSQL with environment variables
4. Start n8n (creates schema)
5. Import workflows: `n8n import:workflow --input=workflows.json`
6. Import credentials: `n8n import:credentials --input=credentials.json`

**Note:** Credential IDs may conflict during import. Review and modify IDs before importing if necessary.

## Reference

- https://docs.n8n.io/hosting/configuration/supported-databases-settings/
