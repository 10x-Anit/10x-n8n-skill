# Getting Started with 10x-n8n-skill

## Prerequisites

- **Node.js** 18.x or higher
- **n8n** instance (cloud or self-hosted)
- **AI coding assistant**: Claude Code, OpenCode, or similar

## Step 1: Install

```bash
npm install -g 10x-n8n-skill
```

This automatically registers 41 commands + 5 skills with your AI assistant.

### Verify installation

```bash
10x-n8n
```

Should print available CLI commands.

### Check commands registered

In Claude Code:
```
/n8n
```

In OpenCode:
```
/n8n
```

## Step 2: Get n8n Running

### Option A: n8n Cloud (easiest)

1. Sign up at [app.n8n.cloud](https://app.n8n.cloud)
2. Choose Starter plan or above (free plan has no API)
3. Go to **Settings > n8n API > Create API Key**
4. Copy the API key

### Option B: Self-Hosted with Docker

```bash
docker volume create n8n_data

docker run -d --name n8n \
  -p 5678:5678 \
  --restart always \
  -v n8n_data:/home/node/.n8n \
  -e GENERIC_TIMEZONE=UTC \
  docker.n8n.io/n8nio/n8n
```

Then:
1. Open http://localhost:5678
2. Create admin account
3. Go to **Settings > n8n API > Create API Key**
4. Copy the API key

### Option C: Self-Hosted with npm

```bash
npm install -g n8n
n8n start
```

Same steps as Docker after that.

## Step 3: Connect

### Via AI assistant

```
/n8n-connect cloud https://my-instance.app.n8n.cloud <api-key>
```

or

```
/n8n-connect self-hosted http://localhost:5678 <api-key>
```

### Via CLI

```bash
10x-n8n connect cloud https://my-instance.app.n8n.cloud n8n_api_xxxxx
```

### Verify

```
/n8n-status
```

Should show: `Connection: OK`

## Step 4: Create Your First Workflow

```
/n8n-new "When a webhook is called, format the data and send a Slack message"
```

The AI will:
1. Look up webhook + Slack nodes in the catalog
2. Ask for your `SLACK_BOT_TOKEN`
3. Create the credential in n8n
4. Build and deploy the workflow
5. Save it locally as a project

## Step 5: Manage Workflows

```
/n8n-projects                    → list all local projects
/n8n-modify my-workflow "add error handling"  → modify safely
/n8n-checkpoint my-workflow      → save working version
/n8n-publish my-workflow         → push to n8n
/n8n-rollback my-workflow v1     → restore if needed
```

## What to Try Next

| Task | Command |
|------|---------|
| Create workflow from description | `/n8n-new <describe it>` |
| Use the full factory pipeline | `/n8n-factory <describe it>` |
| Import existing workflow | `/n8n-import <workflow-id>` |
| Debug a failing workflow | `/n8n-diagnose <id-or-slug>` |
| List all workflows on n8n | `/n8n-workflows` |
| Update skill's node knowledge | `/n8n-evolve --full` |
| See all available commands | `/n8n` |

## Configuration

Connection config is stored at: `~/.claude/n8n-config.json`

```json
{
  "mode": "cloud",
  "baseUrl": "https://my-instance.app.n8n.cloud/api/v1",
  "apiKey": "n8n_api_xxxxx"
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Not connected` | Run `/n8n-connect` |
| `Connection failed` | Check URL and API key, ensure n8n is running |
| `403 Forbidden` | Cloud: ensure Starter+ plan. Self-hosted: check API key scopes |
| `Node not found in catalog` | Run `/n8n-discover` to fetch from instance |
| `Credential error` | Check `.env` file in project folder, run `/n8n-cred-setup` |
| Commands not showing | Reinstall: `npm install -g 10x-n8n-skill` |
