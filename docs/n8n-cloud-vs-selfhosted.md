# n8n — Cloud vs Self-Hosted Comparison

## Overview

n8n is available as a cloud-managed service or as a self-hosted open-source deployment. Both expose the same core workflow engine, but differ in features, pricing, and management overhead.

## Feature Comparison by Plan

| Feature | Community (Self-Hosted) | Free Cloud | Starter Cloud | Pro Cloud | Enterprise |
|---------|------------------------|-----------|---------------|-----------|-----------|
| **Price** | Free | Free | Paid | Paid | Custom |
| **Public REST API** | Yes | No | Yes | Yes | Yes |
| **Workflows** | Unlimited | Limited | Based on plan | Based on plan | Unlimited |
| **Executions** | Unlimited | Limited | Based on plan | Based on plan | Based on plan |
| **Users** | 1 (default) | 1 | Multiple | Multiple | Unlimited |
| **Variables** | No | No | No | Yes | Yes |
| **Projects** | No | No | No | Yes | Yes |
| **RBAC** | No | No | Limited | Yes | Full + custom roles |
| **SSO/SAML/LDAP** | No | No | No | No | Yes |
| **External Secrets** | No | No | No | No | Yes |
| **Log Streaming** | No | No | No | No | Yes |
| **Version Control** | No | No | No | No | Yes |
| **API Key Scopes** | No | No | No | No | Yes |
| **Community Nodes** | Yes (all) | Verified only | Verified only | Verified only | Yes (all) |
| **Queue Mode** | Yes | N/A | N/A | N/A | N/A (managed) |
| **Custom Domain** | Yes | No | No | No | Yes |

## Cloud Advantages

- **Zero infrastructure management** — No servers, Docker, or databases to maintain
- **Automatic updates** — Always running the latest version
- **Built-in SSL** — HTTPS out of the box
- **Managed backups** — Automatic data protection
- **Support** — Official support channels
- **Quick start** — Sign up and start building immediately

## Cloud Limitations

- **API access requires paid plan** — Not available on free tier
- **Execution limits** — Concurrent limits, timeouts, and memory caps
- **Rate limiting** — 60 requests/min per user (not configurable)
- **No queue mode** — Scaling is managed by n8n
- **Community nodes** — Only verified nodes on cloud
- **Webhook restrictions** — Starter plan has trigger type restrictions for MCP

## Self-Hosted Advantages

- **Full API access** — No cost, no restrictions
- **No execution limits** — No timeouts, memory caps, or concurrency limits
- **Configurable rate limits** — Or no rate limits at all
- **Queue mode** — Scale to 50+ workers via Kubernetes
- **All community nodes** — Install any package, including unverified
- **Full control** — Environment variables, database choice, networking
- **Data sovereignty** — Data stays on your infrastructure
- **Custom domain** — Any domain/subdomain you own
- **Cost effective** — Only pay for infrastructure (VPS, cloud hosting)

## Self-Hosted Limitations

- **Infrastructure management** — You handle servers, updates, backups
- **Manual updates** — Must update Docker images or npm packages yourself
- **SSL setup** — Need to configure Traefik, Nginx, or Caddy for HTTPS
- **Security responsibility** — Firewalls, access control, encryption
- **No official support** — Community support only (unless Enterprise)

## When to Choose Cloud

- Small teams wanting quick setup
- No DevOps resources available
- Need managed infrastructure
- Willing to pay for convenience
- Don't need advanced scaling

## When to Choose Self-Hosted

- Need full API access without paying
- High execution volumes
- Data sovereignty requirements
- Custom scaling needs (queue mode)
- Want all community nodes
- Budget-conscious with DevOps capability

## Reference

- https://n8n.io/pricing/
- https://docs.n8n.io/hosting/
