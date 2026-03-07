import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const PROJECTS_DIR = join(process.cwd(), 'projects');

function readJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function appendJSONL(path, obj) {
  appendFileSync(path, JSON.stringify(obj) + '\n', 'utf-8');
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// --- Project CRUD ---

/**
 * Create a new project folder for a workflow.
 * @param {string} name - Workflow name (natural language)
 * @param {object} workflowData - Full workflow JSON from n8n API (or freshly created)
 * @param {string} mode - 'new' or 'import'
 */
export function createProject(name, workflowData, mode = 'new') {
  const slug = slugify(name);
  const dir = join(PROJECTS_DIR, slug);

  if (existsSync(dir)) {
    throw new Error(`Project "${slug}" already exists. Use a different name.`);
  }

  ensureDir(dir);
  ensureDir(join(dir, 'original'));
  ensureDir(join(dir, 'draft'));
  ensureDir(join(dir, 'checkpoints'));
  ensureDir(join(dir, 'credentials'));

  // Meta
  const meta = {
    name,
    slug,
    workflow_id: workflowData.id || null,
    active: workflowData.active || false,
    node_count: workflowData.nodes?.length || 0,
    created_at: new Date().toISOString(),
    created_via: mode,
    current_version: 0,
    last_checkpoint: null,
    last_published: null,
    status: mode === 'import' ? 'imported' : 'draft',
  };
  writeJSON(join(dir, 'meta.json'), meta);

  // Save original
  writeJSON(join(dir, 'original', 'workflow.json'), workflowData);

  // Copy to draft as starting point
  writeJSON(join(dir, 'draft', 'workflow.json'), workflowData);

  // Empty env
  writeFileSync(join(dir, '.env'), '# Secrets for this workflow\n# Add API keys, tokens, etc. here\n# The skill will use these to create credentials in n8n\n', 'utf-8');

  // Env schema (empty until credentials are mapped)
  writeJSON(join(dir, 'env.schema.json'), {
    description: `Environment variables for ${name}`,
    variables: {},
  });

  // Credential map
  writeJSON(join(dir, 'credentials', 'cred-map.json'), {
    description: 'Maps each node to its credential type and the env var holding the secret',
    mappings: [],
  });

  // History log
  appendJSONL(join(dir, 'history.jsonl'), {
    ts: new Date().toISOString(),
    action: mode === 'import' ? 'imported' : 'created',
    msg: `Project created: ${name}`,
    version: 0,
  });

  return { slug, dir, meta };
}

/**
 * List all projects.
 */
export function listProjects() {
  ensureDir(PROJECTS_DIR);
  return readdirSync(PROJECTS_DIR)
    .filter((d) => d !== '.template' && existsSync(join(PROJECTS_DIR, d, 'meta.json')))
    .map((d) => readJSON(join(PROJECTS_DIR, d, 'meta.json')));
}

/**
 * Get a project by slug or workflow name.
 */
export function getProject(slugOrName) {
  const slug = slugify(slugOrName);
  const dir = join(PROJECTS_DIR, slug);
  if (!existsSync(join(dir, 'meta.json'))) {
    // Try finding by original name
    const all = listProjects();
    const match = all.find((p) => p.name.toLowerCase() === slugOrName.toLowerCase());
    if (match) return { meta: match, dir: join(PROJECTS_DIR, match.slug) };
    return null;
  }
  return { meta: readJSON(join(dir, 'meta.json')), dir };
}

/**
 * Get the draft workflow JSON for a project.
 */
export function getDraft(slug) {
  return readJSON(join(PROJECTS_DIR, slug, 'draft', 'workflow.json'));
}

/**
 * Update the draft workflow JSON.
 */
export function saveDraft(slug, workflowData) {
  writeJSON(join(PROJECTS_DIR, slug, 'draft', 'workflow.json'), workflowData);
  appendJSONL(join(PROJECTS_DIR, slug, 'history.jsonl'), {
    ts: new Date().toISOString(),
    action: 'draft_updated',
    msg: `Draft updated: ${workflowData.nodes?.length || 0} nodes`,
  });
}

/**
 * Get the original (imported/baseline) workflow JSON.
 */
export function getOriginal(slug) {
  return readJSON(join(PROJECTS_DIR, slug, 'original', 'workflow.json'));
}

// --- Checkpoints ---

/**
 * Save current draft as a checkpoint. Called when user confirms it's working.
 */
export function saveCheckpoint(slug, message) {
  const draft = getDraft(slug);
  if (!draft) throw new Error(`No draft found for project "${slug}"`);

  const dir = join(PROJECTS_DIR, slug);
  const meta = readJSON(join(dir, 'meta.json'));
  const version = (meta.current_version || 0) + 1;

  writeJSON(join(dir, 'checkpoints', `v${version}.json`), {
    version,
    message,
    saved_at: new Date().toISOString(),
    workflow: draft,
  });

  // Update meta
  meta.current_version = version;
  meta.last_checkpoint = new Date().toISOString();
  meta.status = 'checkpointed';
  writeJSON(join(dir, 'meta.json'), meta);

  appendJSONL(join(dir, 'history.jsonl'), {
    ts: new Date().toISOString(),
    action: 'checkpoint',
    msg: `v${version}: ${message}`,
    version,
  });

  return { version, message };
}

/**
 * List all checkpoints for a project.
 */
export function listCheckpoints(slug) {
  const dir = join(PROJECTS_DIR, slug, 'checkpoints');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const data = readJSON(join(dir, f));
      return {
        version: data.version,
        message: data.message,
        saved_at: data.saved_at,
        nodes: data.workflow?.nodes?.length || 0,
      };
    });
}

/**
 * Rollback draft to a specific checkpoint.
 */
export function rollback(slug, version) {
  const checkpointPath = join(PROJECTS_DIR, slug, 'checkpoints', `v${version}.json`);
  const checkpoint = readJSON(checkpointPath);
  if (!checkpoint) throw new Error(`Checkpoint v${version} not found for "${slug}"`);

  saveDraft(slug, checkpoint.workflow);

  appendJSONL(join(PROJECTS_DIR, slug, 'history.jsonl'), {
    ts: new Date().toISOString(),
    action: 'rollback',
    msg: `Rolled back to v${version}: ${checkpoint.message}`,
    version,
  });

  return checkpoint;
}

// --- Publish ---

/**
 * Mark draft as published. Called after successfully pushing to n8n API.
 * Updates original to match the published version.
 */
export function markPublished(slug, workflowId) {
  const dir = join(PROJECTS_DIR, slug);
  const draft = getDraft(slug);
  const meta = readJSON(join(dir, 'meta.json'));

  // Update original to match what's now live
  writeJSON(join(dir, 'original', 'workflow.json'), draft);

  // Update meta
  meta.workflow_id = workflowId || meta.workflow_id;
  meta.last_published = new Date().toISOString();
  meta.status = 'published';
  meta.active = draft.active || false;
  meta.node_count = draft.nodes?.length || 0;
  writeJSON(join(dir, 'meta.json'), meta);

  appendJSONL(join(dir, 'history.jsonl'), {
    ts: new Date().toISOString(),
    action: 'published',
    msg: `Published to n8n (workflow ID: ${meta.workflow_id})`,
  });

  return meta;
}

// --- Env & Credentials ---

/**
 * Read .env file as key-value pairs.
 */
export function readEnv(slug) {
  const envPath = join(PROJECTS_DIR, slug, '.env');
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

/**
 * Get the credential map for a project.
 */
export function getCredMap(slug) {
  return readJSON(join(PROJECTS_DIR, slug, 'credentials', 'cred-map.json'));
}

/**
 * Add a credential mapping: which node needs which credential type and which env var.
 */
export function addCredMapping(slug, nodeName, credentialType, envVarKeys, n8nCredId = null) {
  const dir = join(PROJECTS_DIR, slug);
  const credMap = getCredMap(slug) || { mappings: [] };

  credMap.mappings.push({
    node: nodeName,
    credential_type: credentialType,
    env_vars: envVarKeys,
    n8n_credential_id: n8nCredId,
    created_at: new Date().toISOString(),
  });

  writeJSON(join(dir, 'credentials', 'cred-map.json'), credMap);

  // Update env schema
  const schema = readJSON(join(dir, 'env.schema.json')) || { variables: {} };
  for (const key of envVarKeys) {
    if (!schema.variables[key]) {
      schema.variables[key] = {
        description: `Required by ${nodeName} (${credentialType})`,
        required: true,
      };
    }
  }
  writeJSON(join(dir, 'env.schema.json'), schema);

  return credMap;
}

/**
 * Get project history.
 */
export function getHistory(slug, limit = 20) {
  const historyPath = join(PROJECTS_DIR, slug, 'history.jsonl');
  if (!existsSync(historyPath)) return [];
  const lines = readFileSync(historyPath, 'utf-8').split('\n').filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l));
}

export { PROJECTS_DIR, slugify };
