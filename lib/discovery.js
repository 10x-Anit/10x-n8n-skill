import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getConfig } from './config.js';

const DOCS_DIR = join(process.cwd(), 'docs');
const NODES_DIR = join(DOCS_DIR, 'nodes');
const CATALOG_FILE = join(NODES_DIR, 'node-catalog.json');
const LIVE_NODES_FILE = join(NODES_DIR, 'live-nodes.json');
const DOC_LINKS_FILE = join(NODES_DIR, 'doc-links.json');

function readJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Official n8n documentation base URLs.
 * Agents use these to fetch latest docs when local reference is insufficient.
 */
export const N8N_DOC_URLS = {
  // Node documentation base
  nodes_base: 'https://docs.n8n.io/integrations/builtin/',
  core_nodes: 'https://docs.n8n.io/integrations/builtin/core-nodes/',
  app_nodes: 'https://docs.n8n.io/integrations/builtin/app-nodes/',
  trigger_nodes: 'https://docs.n8n.io/integrations/builtin/trigger-nodes/',
  cluster_nodes: 'https://docs.n8n.io/integrations/builtin/cluster-nodes/',

  // API docs
  api_reference: 'https://docs.n8n.io/api/api-reference/',
  api_auth: 'https://docs.n8n.io/api/authentication/',

  // Setup docs
  hosting: 'https://docs.n8n.io/hosting/',
  docker: 'https://docs.n8n.io/hosting/installation/docker/',
  env_vars: 'https://docs.n8n.io/hosting/configuration/environment-variables/',
  databases: 'https://docs.n8n.io/hosting/configuration/supported-databases-settings/',
  scaling: 'https://docs.n8n.io/hosting/scaling/queue-mode/',

  // Workflow docs
  workflows: 'https://docs.n8n.io/workflows/',
  executions: 'https://docs.n8n.io/workflows/executions/',
  credentials: 'https://docs.n8n.io/credentials/',

  // Node-specific doc URL pattern
  // Usage: node_doc_url('n8n-nodes-base.slack') → full URL
  node_doc_pattern: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.',
  core_node_doc_pattern: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.',
  trigger_doc_pattern: 'https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.',
};

/**
 * Build the documentation URL for a specific node type.
 * @param {string} nodeType - e.g. 'n8n-nodes-base.slack'
 * @returns {string} Full documentation URL
 */
export function getNodeDocUrl(nodeType) {
  // Remove package prefix
  const shortName = nodeType
    .replace('n8n-nodes-base.', '')
    .replace('@n8n/n8n-nodes-langchain.', '');

  // Check if it's a trigger
  if (shortName.endsWith('Trigger') || shortName.endsWith('trigger')) {
    return `${N8N_DOC_URLS.trigger_doc_pattern}${shortName.toLowerCase()}/`;
  }

  // Core nodes
  const coreNodes = [
    'webhook', 'httpRequest', 'code', 'set', 'if', 'switch', 'merge',
    'splitInBatches', 'wait', 'noOp', 'executeWorkflow', 'respondToWebhook',
    'scheduleTrigger', 'manualTrigger', 'errorTrigger', 'n8n',
    'function', 'functionItem', 'executionData',
  ];

  if (coreNodes.includes(shortName)) {
    return `${N8N_DOC_URLS.core_node_doc_pattern}${shortName.toLowerCase()}/`;
  }

  // App/integration nodes
  return `${N8N_DOC_URLS.node_doc_pattern}${shortName.toLowerCase()}/`;
}

/**
 * Fetch available node types from a self-hosted n8n instance.
 * Uses the internal /rest/ endpoint that the n8n editor UI uses.
 *
 * NOTE: This requires authentication via session cookie or JWT, not just API key.
 * For self-hosted, we try the internal endpoint first.
 * If unavailable, we fall back to the static catalog.
 */
export async function fetchLiveNodeTypes() {
  const config = getConfig();
  if (!config) throw new Error('Not connected. Run /n8n-connect first.');

  const baseUrl = config.baseUrl.replace(/\/$/, '');

  // Try internal endpoint (works on self-hosted)
  const endpoints = [
    `${baseUrl}/rest/node-types`,
    `${baseUrl}/types/nodes.json`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': config.apiKey,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return processNodeTypesResponse(data);
      }
    } catch {
      continue; // Try next endpoint
    }
  }

  // Fallback: extract node types from existing workflows on the instance
  return await extractNodeTypesFromWorkflows();
}

/**
 * Extract node types by scanning all workflows on the instance.
 * Fallback when internal endpoints aren't available.
 */
async function extractNodeTypesFromWorkflows() {
  const { listWorkflows, getWorkflow } = await import('./api.js');

  const response = await listWorkflows();
  const workflows = response.data || response;
  const nodeTypes = new Map();

  for (const wf of workflows.slice(0, 50)) { // Scan up to 50 workflows
    try {
      const full = await getWorkflow(wf.id);
      for (const node of full.nodes || []) {
        if (!nodeTypes.has(node.type)) {
          nodeTypes.set(node.type, {
            type: node.type,
            typeVersion: node.typeVersion,
            category: categorizeNode(node.type),
            doc_url: getNodeDocUrl(node.type),
            seen_in_workflows: [wf.id],
            sample_params: Object.keys(node.parameters || {}),
            has_credentials: !!node.credentials,
            credential_types: node.credentials ? Object.keys(node.credentials) : [],
          });
        } else {
          const existing = nodeTypes.get(node.type);
          if (!existing.seen_in_workflows.includes(wf.id)) {
            existing.seen_in_workflows.push(wf.id);
          }
        }
      }
    } catch {
      continue;
    }
  }

  return Array.from(nodeTypes.values());
}

/**
 * Process raw node types response from n8n internal API.
 */
function processNodeTypesResponse(data) {
  const nodes = Array.isArray(data) ? data : (data.data || []);
  return nodes.map((n) => ({
    type: n.name || n.type,
    displayName: n.displayName,
    description: n.description,
    category: n.group?.[0] || categorizeNode(n.name || n.type),
    version: n.version,
    doc_url: getNodeDocUrl(n.name || n.type),
    inputs: n.inputs,
    outputs: n.outputs,
    credentials: n.credentials?.map((c) => ({
      name: c.name,
      required: c.required,
    })),
    properties: n.properties?.map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      default: p.default,
      options: p.options?.map((o) => o.value || o.name),
    })),
  }));
}

/**
 * Categorize a node type string.
 */
function categorizeNode(type) {
  if (type.includes('Trigger') || type.includes('trigger')) return 'trigger';
  const coreTypes = [
    'webhook', 'httpRequest', 'code', 'set', 'if', 'switch', 'merge',
    'splitInBatches', 'wait', 'noOp', 'function', 'executeWorkflow',
    'respondToWebhook', 'scheduleTrigger', 'manualTrigger', 'errorTrigger',
    'executionData', 'stickyNote',
  ];
  const shortName = type.replace('n8n-nodes-base.', '');
  if (coreTypes.includes(shortName)) return 'core';
  if (type.startsWith('@n8n/n8n-nodes-langchain')) return 'ai';
  return 'app';
}

/**
 * Save discovered live nodes to local reference.
 */
export function saveLiveNodes(nodes) {
  if (!existsSync(NODES_DIR)) mkdirSync(NODES_DIR, { recursive: true });
  writeJSON(LIVE_NODES_FILE, {
    fetched_at: new Date().toISOString(),
    count: nodes.length,
    nodes,
  });
  return LIVE_NODES_FILE;
}

/**
 * Get live nodes from local cache.
 */
export function getLiveNodes() {
  return readJSON(LIVE_NODES_FILE);
}

/**
 * Check if live nodes cache is stale (older than maxAge hours).
 */
export function isLiveNodesCacheStale(maxAgeHours = 24) {
  const data = getLiveNodes();
  if (!data || !data.fetched_at) return true;
  const age = Date.now() - new Date(data.fetched_at).getTime();
  return age > maxAgeHours * 60 * 60 * 1000;
}

/**
 * Build the complete doc-links reference file.
 * Maps every known node type to its official documentation URL.
 */
export function buildDocLinks(liveNodes) {
  const links = {
    generated_at: new Date().toISOString(),
    base_urls: N8N_DOC_URLS,
    node_docs: {},
  };

  // From live nodes
  if (liveNodes?.nodes) {
    for (const node of liveNodes.nodes) {
      links.node_docs[node.type] = {
        doc_url: node.doc_url || getNodeDocUrl(node.type),
        category: node.category,
        displayName: node.displayName || node.type.split('.').pop(),
      };
    }
  }

  // From static catalog as fallback
  const catalog = readJSON(CATALOG_FILE);
  if (catalog) {
    for (const category of ['triggers', 'core', 'integrations']) {
      for (const [, node] of Object.entries(catalog[category] || {})) {
        if (node.type && !links.node_docs[node.type]) {
          links.node_docs[node.type] = {
            doc_url: getNodeDocUrl(node.type),
            category,
          };
        }
      }
    }
  }

  writeJSON(DOC_LINKS_FILE, links);
  return links;
}

/**
 * Merge live-discovered nodes into the static catalog.
 * Adds new nodes, updates existing ones with live data.
 */
export function mergeLiveIntoCatalog(liveNodes) {
  const catalog = readJSON(CATALOG_FILE) || { triggers: {}, core: {}, integrations: {} };

  for (const node of liveNodes) {
    const shortName = (node.type || '')
      .replace('n8n-nodes-base.', '')
      .replace('@n8n/n8n-nodes-langchain.', 'langchain-');

    if (!shortName) continue;

    const categoryKey = node.category === 'trigger' ? 'triggers'
      : node.category === 'core' ? 'core'
        : 'integrations';

    if (!catalog[categoryKey][shortName]) {
      // New node discovered — add minimal entry with doc link
      catalog[categoryKey][shortName] = {
        type: node.type,
        category: node.category,
        doc_url: node.doc_url || getNodeDocUrl(node.type),
        discovered_at: new Date().toISOString(),
        params: {},
        credentials: node.credential_types?.[0] || null,
        notes: `Auto-discovered. See ${node.doc_url} for full documentation.`,
      };

      // Add properties if available from live data
      if (node.properties) {
        for (const prop of node.properties) {
          catalog[categoryKey][shortName].params[prop.name] = {
            type: prop.type,
            required: prop.required || false,
            default: prop.default,
            options: prop.options,
          };
        }
      }
    } else {
      // Existing node — add doc_url if missing
      if (!catalog[categoryKey][shortName].doc_url) {
        catalog[categoryKey][shortName].doc_url = node.doc_url || getNodeDocUrl(node.type);
      }
    }
  }

  catalog._last_updated = new Date().toISOString();
  catalog._description = 'Reference catalog of n8n nodes. Auto-updated from live instance + docs.n8n.io. Each entry has a doc_url for latest official documentation.';

  writeJSON(CATALOG_FILE, catalog);
  return catalog;
}
