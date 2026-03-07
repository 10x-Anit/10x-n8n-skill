import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const TRACK_DIR = join(process.cwd(), '.n8n-track');
const HEAD_FILE = join(TRACK_DIR, 'HEAD.json');
const BRANCHES_FILE = join(TRACK_DIR, 'branches.json');
const COMMITS_FILE = join(TRACK_DIR, 'commits.jsonl');
const EXECUTIONS_FILE = join(TRACK_DIR, 'executions.jsonl');
const REFS_DIR = join(TRACK_DIR, 'refs', 'workflows');
const SNAPSHOTS_DIR = join(TRACK_DIR, 'snapshots');
const DIFFS_DIR = join(TRACK_DIR, 'diffs');

// --- Helpers ---

function hash(data) {
  return createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

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

function readJSONL(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// --- HEAD ---

export function getHead() {
  return readJSON(HEAD_FILE);
}

export function updateHead(updates) {
  const head = getHead() || {};
  writeJSON(HEAD_FILE, { ...head, ...updates });
}

// --- Branches ---

export function getBranches() {
  return readJSON(BRANCHES_FILE) || {};
}

export function createBranch(name, workflowId, description) {
  const branches = getBranches();
  branches[name] = {
    created: now(),
    head_commit: null,
    workflow_id: workflowId,
    description: description || `Branch for workflow ${workflowId}`,
  };
  writeJSON(BRANCHES_FILE, branches);
  return branches[name];
}

export function updateBranch(name, updates) {
  const branches = getBranches();
  if (!branches[name]) throw new Error(`Branch ${name} not found`);
  branches[name] = { ...branches[name], ...updates };
  writeJSON(BRANCHES_FILE, branches);
}

// --- Refs ---

export function getWorkflowRef(workflowId) {
  const refPath = join(REFS_DIR, `${workflowId}.json`);
  return readJSON(refPath);
}

export function setWorkflowRef(workflowId, data) {
  ensureDir(REFS_DIR);
  const ref = {
    id: workflowId,
    name: data.name,
    active: data.active,
    hash: hash(data),
    node_count: data.nodes ? data.nodes.length : 0,
    updated_at: now(),
  };
  writeJSON(join(REFS_DIR, `${workflowId}.json`), ref);
  return ref;
}

export function listWorkflowRefs() {
  ensureDir(REFS_DIR);
  return readdirSync(REFS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJSON(join(REFS_DIR, f)));
}

// --- Snapshots ---

export function saveSnapshot(workflowId, workflowData) {
  const h = hash(workflowData);
  const dir = join(SNAPSHOTS_DIR, String(workflowId));
  ensureDir(dir);
  writeJSON(join(dir, `${h}.json`), workflowData);
  return h;
}

export function getSnapshot(workflowId, commitHash) {
  const path = join(SNAPSHOTS_DIR, String(workflowId), `${commitHash}.json`);
  return readJSON(path);
}

export function listSnapshots(workflowId) {
  const dir = join(SNAPSHOTS_DIR, String(workflowId));
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
}

// --- Commits ---

export function commit(workflowId, branchName, message, snapshotHash, parentHash) {
  const entry = {
    h: snapshotHash,
    ts: now(),
    wf: String(workflowId),
    br: branchName,
    msg: message,
    parent: parentHash || null,
  };
  appendJSONL(COMMITS_FILE, entry);
  updateBranch(branchName, { head_commit: snapshotHash });
  return entry;
}

export function getCommits(filter = {}) {
  const all = readJSONL(COMMITS_FILE);
  return all.filter((c) => {
    if (filter.workflowId && c.wf !== String(filter.workflowId)) return false;
    if (filter.branch && c.br !== filter.branch) return false;
    return true;
  });
}

export function getLastCommit(workflowId) {
  const commits = getCommits({ workflowId });
  return commits.length > 0 ? commits[commits.length - 1] : null;
}

// --- Diffs ---

export function computeDiff(oldWorkflow, newWorkflow) {
  const oldNodes = new Map((oldWorkflow?.nodes || []).map((n) => [n.name, n]));
  const newNodes = new Map((newWorkflow?.nodes || []).map((n) => [n.name, n]));

  const added = [];
  const removed = [];
  const modified = [];

  for (const [name, node] of newNodes) {
    if (!oldNodes.has(name)) {
      added.push({ name, type: node.type });
    } else {
      const oldNode = oldNodes.get(name);
      const oldStr = JSON.stringify(oldNode.parameters);
      const newStr = JSON.stringify(node.parameters);
      if (oldStr !== newStr) {
        modified.push({ name, type: node.type, changes: 'parameters_changed' });
      }
    }
  }

  for (const [name, node] of oldNodes) {
    if (!newNodes.has(name)) {
      removed.push({ name, type: node.type });
    }
  }

  const oldConn = JSON.stringify(oldWorkflow?.connections || {});
  const newConn = JSON.stringify(newWorkflow?.connections || {});

  return {
    nodes_added: added,
    nodes_removed: removed,
    nodes_modified: modified,
    connections_changed: oldConn !== newConn,
    summary: `+${added.length} -${removed.length} ~${modified.length} nodes`,
  };
}

export function saveDiff(workflowId, oldHash, newHash, diff) {
  const dir = join(DIFFS_DIR, String(workflowId));
  ensureDir(dir);
  writeJSON(join(dir, `${oldHash}..${newHash}.json`), {
    old: oldHash,
    new: newHash,
    ...diff,
    created_at: now(),
  });
}

// --- Executions ---

export function logExecution(data) {
  const entry = {
    id: data.id,
    wf: String(data.workflowId),
    ts: data.startedAt || now(),
    status: data.status,
    dur_ms: data.stoppedAt && data.startedAt
      ? new Date(data.stoppedAt) - new Date(data.startedAt)
      : null,
    trigger: data.mode || 'unknown',
    error: data.status === 'error' ? (data.error || 'unknown error') : null,
  };
  appendJSONL(EXECUTIONS_FILE, entry);
  return entry;
}

export function getExecutions(filter = {}) {
  const all = readJSONL(EXECUTIONS_FILE);
  return all.filter((e) => {
    if (filter.workflowId && e.wf !== String(filter.workflowId)) return false;
    if (filter.status && e.status !== filter.status) return false;
    return true;
  });
}

// --- Init ---

export function isInitialized() {
  return existsSync(HEAD_FILE) && (getHead()?.initialized === true);
}

export function initTracker(instance, mode) {
  ensureDir(TRACK_DIR);
  ensureDir(join(TRACK_DIR, 'refs', 'workflows'));
  ensureDir(join(TRACK_DIR, 'refs', 'agents'));
  ensureDir(SNAPSHOTS_DIR);
  ensureDir(DIFFS_DIR);
  ensureDir(join(TRACK_DIR, 'executions'));
  ensureDir(join(TRACK_DIR, 'handoffs'));
  ensureDir(join(TRACK_DIR, 'index'));

  updateHead({
    current_branch: 'main',
    last_sync: null,
    instance,
    mode,
    initialized: true,
  });

  // Ensure main branch exists
  const branches = getBranches();
  if (!branches.main) {
    createBranch('main', null, 'Default branch — tracks overall instance state');
  }

  return getHead();
}
