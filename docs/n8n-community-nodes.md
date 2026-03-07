# n8n Community Nodes

## Overview

Community nodes extend n8n's capabilities beyond the built-in node library. They are npm packages created by the community that add integrations for additional services.

## Types of Community Nodes

### Verified Nodes
- Reviewed and approved by n8n
- Available on both cloud and self-hosted
- Installable from the n8n UI
- Appear in search results alongside built-in nodes

### Unverified Nodes
- Published on npm but not reviewed by n8n
- Available on self-hosted only (NOT on n8n Cloud)
- Install via Settings or CLI
- Use at your own risk

## Installation Methods

### Method 1: GUI Installation (Verified Nodes)

1. Open the Canvas
2. Click **+** or press **Tab** to open node search
3. Search for the desired node
4. If it's a verified community node, click to install
5. Node becomes available to all instance users

### Method 2: Settings Menu

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter the npm package name (e.g., `n8n-nodes-google-drive`)
4. Optionally specify version: `n8n-nodes-google-drive@1.2.0`
5. Click **Install**

### Method 3: CLI Installation

Required for:
- Queue mode instances (install on ALL workers)
- Private npm packages
- Specific version pinning

```bash
# Inside n8n container or environment
cd ~/.n8n
npm install n8n-nodes-package-name

# Or with specific version
npm install n8n-nodes-package-name@1.0.0
```

**Queue mode note:** Community nodes must be installed on EVERY worker instance, not just the main instance.

## Creating Custom Nodes

### Scaffold a New Node Package

```bash
npm create @n8n/node
```

This creates a starter project with:
- Node definition boilerplate
- Credential definition
- Package.json configured for n8n
- TypeScript support

### Development with Hot Reload

```bash
n8n-node dev
```

Watches for changes and reloads nodes automatically during development.

### Node Package Structure

```
n8n-nodes-my-package/
├── package.json
├── nodes/
│   └── MyNode/
│       ├── MyNode.node.ts
│       └── MyNode.node.json
├── credentials/
│   └── MyServiceApi.credentials.ts
└── tsconfig.json
```

### package.json for Custom Nodes

```json
{
  "name": "n8n-nodes-my-service",
  "version": "1.0.0",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/MyNode/MyNode.node.js"
    ],
    "credentials": [
      "dist/credentials/MyServiceApi.credentials.js"
    ]
  }
}
```

## Managing Community Nodes

### View Installed Nodes
- Go to **Settings > Community Nodes**
- Lists all installed community packages with versions

### Update a Node
- Go to **Settings > Community Nodes**
- Click **Update** next to the package
- Or via CLI: `npm update n8n-nodes-package-name`

### Remove a Node
- Go to **Settings > Community Nodes**
- Click **Remove** next to the package
- Workflows using removed nodes will break

## Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `N8N_COMMUNITY_PACKAGES_ENABLED` | Enable/disable community nodes | `true` |
| `NODE_FUNCTION_ALLOW_EXTERNAL` | Allow external npm modules in Code node | — |
| `NODES_EXCLUDE` | Exclude specific node types | — |

## Permissions

- Only the **instance owner** can install/manage verified community nodes
- All instance members can use installed community nodes
- Cloud users can only install verified nodes

## Reference

- https://docs.n8n.io/integrations/community-nodes/
- https://docs.n8n.io/integrations/community-nodes/installation/
- https://docs.n8n.io/integrations/creating-nodes/
