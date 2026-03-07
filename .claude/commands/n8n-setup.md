---
description: "Guide local n8n installation — Docker or npm"
argument-hint: "[docker|npm]"
---

CONTEXT: Walk user through installing n8n locally and generating an API key.

STEPS:
1. PRINT: `10x.in — Installing n8n`
2. IF $ARGUMENTS specifies method → use it | ELSE → ASK: docker or npm
3. IF docker:
   - CHECK: `docker --version`
   - RUN: `docker volume create n8n_data`
   - RUN: `docker run -d --name n8n -p 5678:5678 --restart always -v n8n_data:/home/node/.n8n -e GENERIC_TIMEZONE=UTC docker.n8n.io/n8nio/n8n`
4. IF npm:
   - CHECK: `node --version` (needs 18.x/20.x/22.x)
   - RUN: `npm install -g n8n`
   - RUN: `n8n start`
5. GUIDE first-time setup:
   - Open http://localhost:5678
   - Create admin account
   - Settings → n8n API → Create API Key → copy key
6. SUGGEST: `/n8n-connect self-hosted http://localhost:5678 <api-key>`
7. PRINT: `10x.in — Setup complete`

REQUIREMENTS: Docker OR Node.js 18+, 2 CPU cores, 2GB RAM, 20GB SSD

$ARGUMENTS
