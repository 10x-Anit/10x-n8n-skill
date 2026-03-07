import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const TRACK_DIR = join(process.cwd(), '.n8n-track');
const AGENTS_DIR = join(process.cwd(), '.claude', 'agents');
const AGENTS_FILE_LEGACY = join(TRACK_DIR, 'agents.json');
const HANDOFFS_DIR = join(TRACK_DIR, 'handoffs');

function readJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Frontmatter Parser (zero deps) ---

function parseAgentMd(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  // Parse YAML frontmatter (simple key: value)
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*"?(.+?)"?\s*$/);
    if (kv) frontmatter[kv[1]] = kv[2];
  }

  const body = match[2].trim();

  // Extract structured sections from markdown body
  const extract = (label) => {
    const re = new RegExp(`^${label}:\\s*(.+)$`, 'm');
    const m = body.match(re);
    return m ? m[1].trim() : '';
  };

  const extractList = (label) => {
    const re = new RegExp(`^${label}[^\\n]*\\n((?:- [^\\n]+\\n?)*)`, 'm');
    const m = body.match(re);
    if (!m) return [];
    return m[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
  };

  const handsOffTo = extract('HANDS OFF TO');
  const handsBackMatch = body.match(/^ON FAILURE:\s*Hand back to (\w+)/m);

  return {
    id: frontmatter.name || filePath.replace(/.*[/\\]/, '').replace('.md', ''),
    name: extract('ROLE') || frontmatter.name,
    duty: extract('DUTY'),
    single_task: extract('SINGLE TASK'),
    reads: extractList('READ THESE FILES'),
    writes: extractList('OUTPUT'),
    web_fallback: extractList('WEB FALLBACK'),
    audit_before_handoff: extract('AUDIT BEFORE HANDOFF'),
    hands_off_to: handsOffTo || null,
    hands_back_to_on_fail: handsBackMatch ? handsBackMatch[1] : undefined,
    prompt_budget: parseInt(extract('BUDGET')) || 800,
    // Keep frontmatter for Claude Code agent features
    tools: frontmatter.tools || '',
    model: frontmatter.model || 'sonnet',
    maxTurns: parseInt(frontmatter.maxTurns) || 10,
    // Raw body for direct use as agent prompt
    _raw_body: body,
  };
}

// --- Pipeline Order ---

export const PIPELINE = ['intelligence', 'design', 'production', 'compliance', 'operations', 'records'];

// --- Agent Definitions ---

let _cachedRoles = null;

export function getAgentRoles() {
  if (_cachedRoles) return _cachedRoles;

  // Primary: read from .claude/agents/*.md
  if (existsSync(AGENTS_DIR)) {
    const files = readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
    if (files.length > 0) {
      const roles = {};
      for (const file of files) {
        const agent = parseAgentMd(join(AGENTS_DIR, file));
        if (agent) roles[agent.id] = agent;
      }
      _cachedRoles = roles;
      return roles;
    }
  }

  // Fallback: legacy .n8n-track/agents.json
  const agents = readJSON(AGENTS_FILE_LEGACY);
  _cachedRoles = agents?.roles || {};
  return _cachedRoles;
}

export function getAgentRole(roleId) {
  const roles = getAgentRoles();
  return roles[roleId] || null;
}

/**
 * Get the raw markdown body of an agent (for use as a direct agent prompt).
 */
export function getAgentPromptBody(roleId) {
  const role = getAgentRole(roleId);
  return role?._raw_body || null;
}

/**
 * Clear cached roles (e.g., after modifying agent files).
 */
export function clearAgentCache() {
  _cachedRoles = null;
}

/**
 * Get the next agent in the pipeline after the given role.
 */
export function getNextAgent(currentRole) {
  const idx = PIPELINE.indexOf(currentRole);
  if (idx === -1 || idx >= PIPELINE.length - 1) return null;
  return PIPELINE[idx + 1];
}

/**
 * Build a focused prompt for one of the 6 agents.
 * Includes: role, duty, task, context refs, audit checklist, web fallback URLs.
 */
export function buildAgentPrompt(roleId, taskDescription, contextRefs = [], payload = {}) {
  const role = getAgentRole(roleId);
  if (!role) throw new Error(`Unknown agent role: ${roleId}`);

  const lines = [
    `ROLE: ${role.name} (${roleId})`,
    `DUTY: ${role.duty}`,
    `SINGLE TASK: ${role.single_task}`,
    `BUDGET: ${role.prompt_budget} tokens max output`,
    '',
    `TASK: ${taskDescription}`,
    '',
  ];

  // Context files
  lines.push('READ THESE FILES (exact line ranges only):');
  if (contextRefs.length > 0) {
    for (const ref of contextRefs) {
      lines.push(`  - ${ref}`);
    }
  } else {
    for (const readPath of role.reads) {
      lines.push(`  - ${readPath}`);
    }
  }

  // Payload from previous agent
  if (Object.keys(payload).length > 0) {
    lines.push('');
    lines.push('DATA FROM PREVIOUS AGENT:');
    lines.push(JSON.stringify(payload, null, 2));
  }

  // Web fallback
  if (role.web_fallback && role.web_fallback.length > 0) {
    lines.push('');
    lines.push('IF LOCAL REFERENCE IS INSUFFICIENT — fetch from these URLs:');
    for (const url of role.web_fallback) {
      lines.push(`  - ${url}`);
    }
    lines.push('Or web search: "n8n <topic> site:docs.n8n.io"');
  }

  // Output instructions
  lines.push('');
  lines.push('OUTPUT FILES TO WRITE:');
  for (const writePath of role.writes) {
    lines.push(`  - ${writePath}`);
  }

  // Audit checklist
  lines.push('');
  lines.push('AUDIT BEFORE HANDOFF (mandatory):');
  lines.push(`  ${role.audit_before_handoff}`);

  // Handoff target
  const nextAgent = role.hands_off_to;
  if (nextAgent) {
    lines.push('');
    lines.push(`HAND OFF TO: ${nextAgent}`);
    lines.push('Create handoff ticket in handoffs/ with:');
    lines.push('  - task: single line description of what the next agent should do');
    lines.push('  - context_refs: exact file:line ranges the next agent needs');
    lines.push('  - validation_report: what you checked and what passed');
    lines.push('  - payload: structured data the next agent needs');
  }

  if (role.hands_back_to_on_fail) {
    lines.push('');
    lines.push(`ON FAILURE: Hand back to ${role.hands_back_to_on_fail} with exact error details.`);
  }

  // Rules
  lines.push('');
  lines.push('RULES:');
  lines.push('- Read ONLY the referenced context lines. Never load full files.');
  lines.push('- No verbose output. Compact, structured data only.');
  lines.push('- If a node type is not in the catalog, web-search docs.n8n.io before guessing.');
  lines.push('- Never assume credential fields. Always check catalog or credential schema API.');
  lines.push('- Include doc_url for every node you reference.');

  return lines.join('\n');
}

// --- Handoff Tickets ---

export function createHandoff(from, to, task, contextRefs = [], payload = {}, validationReport = {}) {
  const timestamp = Date.now();
  const id = `ho-${timestamp}-${from}-to-${to}`;
  const ticket = {
    id,
    from,
    to,
    status: 'pending',
    task,
    context_refs: contextRefs,
    validation_report: validationReport,
    payload,
    created_at: new Date().toISOString(),
    picked_at: null,
    done_at: null,
  };

  if (!existsSync(HANDOFFS_DIR)) {
    const { mkdirSync } = require('fs');
    mkdirSync(HANDOFFS_DIR, { recursive: true });
  }

  writeJSON(join(HANDOFFS_DIR, `${id}.json`), ticket);
  return ticket;
}

export function listHandoffs(filter = {}) {
  if (!existsSync(HANDOFFS_DIR)) return [];

  return readdirSync(HANDOFFS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJSON(join(HANDOFFS_DIR, f)))
    .filter((t) => {
      if (!t) return false;
      if (filter.to && t.to !== filter.to) return false;
      if (filter.from && t.from !== filter.from) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export function pickHandoff(handoffId) {
  const files = readdirSync(HANDOFFS_DIR).filter((f) => f.includes(handoffId));
  if (files.length === 0) throw new Error(`Handoff ${handoffId} not found`);

  const path = join(HANDOFFS_DIR, files[0]);
  const ticket = readJSON(path);
  ticket.status = 'in_progress';
  ticket.picked_at = new Date().toISOString();
  writeJSON(path, ticket);
  return ticket;
}

export function completeHandoff(handoffId, result = {}) {
  const files = readdirSync(HANDOFFS_DIR).filter((f) => f.includes(handoffId));
  if (files.length === 0) throw new Error(`Handoff ${handoffId} not found`);

  const path = join(HANDOFFS_DIR, files[0]);
  const ticket = readJSON(path);
  ticket.status = 'done';
  ticket.done_at = new Date().toISOString();
  ticket.result = result;
  writeJSON(path, ticket);
  return ticket;
}

export function failHandoff(handoffId, error, handBackTo = null) {
  const files = readdirSync(HANDOFFS_DIR).filter((f) => f.includes(handoffId));
  if (files.length === 0) throw new Error(`Handoff ${handoffId} not found`);

  const path = join(HANDOFFS_DIR, files[0]);
  const ticket = readJSON(path);
  ticket.status = 'failed';
  ticket.done_at = new Date().toISOString();
  ticket.error = error;
  writeJSON(path, ticket);

  // Create retry handoff going back
  if (handBackTo) {
    return createHandoff(
      ticket.to,
      handBackTo,
      `FIX: ${error}`,
      ticket.context_refs,
      { ...ticket.payload, error_details: error, original_task: ticket.task }
    );
  }

  return ticket;
}

/**
 * Run the full pipeline for a task.
 * Returns an array of handoff results.
 */
export function getPipelineState() {
  const handoffs = listHandoffs();
  const state = {};

  for (const roleId of PIPELINE) {
    const role = getAgentRole(roleId);
    const pending = handoffs.filter((h) => h.to === roleId && h.status === 'pending');
    const active = handoffs.filter((h) => h.to === roleId && h.status === 'in_progress');
    const done = handoffs.filter((h) => h.from === roleId && h.status === 'done');
    const failed = handoffs.filter((h) => h.to === roleId && h.status === 'failed');

    state[roleId] = {
      name: role?.name || roleId,
      duty: role?.single_task || '',
      pending: pending.length,
      active: active.length,
      done: done.length,
      failed: failed.length,
      budget: role?.prompt_budget || 0,
      last_activity: [...done, ...failed]
        .sort((a, b) => new Date(b.done_at) - new Date(a.done_at))[0] || null,
    };
  }

  return state;
}

/**
 * Clean up completed handoffs older than maxAge.
 */
export function cleanHandoffs(maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!existsSync(HANDOFFS_DIR)) return 0;

  const cutoff = Date.now() - maxAgeMs;
  let cleaned = 0;

  for (const file of readdirSync(HANDOFFS_DIR).filter((f) => f.endsWith('.json'))) {
    const ticket = readJSON(join(HANDOFFS_DIR, file));
    if (!ticket) continue;
    if (
      (ticket.status === 'done' || ticket.status === 'failed') &&
      ticket.done_at &&
      new Date(ticket.done_at).getTime() < cutoff
    ) {
      unlinkSync(join(HANDOFFS_DIR, file));
      cleaned++;
    }
  }

  return cleaned;
}
