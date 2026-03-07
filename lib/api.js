import { getApiBaseUrl, getApiKey } from './config.js';

/**
 * Make an authenticated request to the n8n API
 * @param {string} endpoint - API endpoint path (e.g. /workflows)
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
export async function n8nFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const apiKey = getApiKey();

  if (!baseUrl || !apiKey) {
    throw new Error(
      'n8n not configured. Run /n8n-connect to set up your connection.'
    );
  }

  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'X-N8N-API-KEY': apiKey,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `n8n API error ${response.status}: ${response.statusText}\n${errorBody}`
    );
  }

  return response.json();
}

// --- Workflows ---

export async function listWorkflows(query = {}) {
  const params = new URLSearchParams();
  if (query.active !== undefined) params.set('active', query.active);
  if (query.limit) params.set('limit', query.limit);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.tags) params.set('tags', query.tags);
  const qs = params.toString();
  return n8nFetch(`/workflows${qs ? '?' + qs : ''}`);
}

export async function getWorkflow(id) {
  return n8nFetch(`/workflows/${id}`);
}

export async function createWorkflow(data) {
  return n8nFetch('/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWorkflow(id, data) {
  return n8nFetch(`/workflows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkflow(id) {
  return n8nFetch(`/workflows/${id}`, { method: 'DELETE' });
}

export async function activateWorkflow(id) {
  return updateWorkflow(id, { active: true });
}

export async function deactivateWorkflow(id) {
  return updateWorkflow(id, { active: false });
}

// --- Executions ---

export async function listExecutions(query = {}) {
  const params = new URLSearchParams();
  if (query.workflowId) params.set('workflowId', query.workflowId);
  if (query.status) params.set('status', query.status);
  if (query.limit) params.set('limit', query.limit);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.includeData !== undefined)
    params.set('includeData', query.includeData);
  const qs = params.toString();
  return n8nFetch(`/executions${qs ? '?' + qs : ''}`);
}

export async function getExecution(id, includeData = false) {
  const qs = includeData ? '?includeData=true' : '';
  return n8nFetch(`/executions/${id}${qs}`);
}

export async function stopExecution(id) {
  return n8nFetch(`/executions/${id}/stop`, { method: 'POST' });
}

export async function deleteExecution(id) {
  return n8nFetch(`/executions/${id}`, { method: 'DELETE' });
}

// --- Credentials ---

export async function listCredentials() {
  return n8nFetch('/credentials');
}

export async function getCredentialSchema(typeName) {
  return n8nFetch(`/credentials/schema/${typeName}`);
}

export async function createCredential(data) {
  return n8nFetch('/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteCredential(id) {
  return n8nFetch(`/credentials/${id}`, { method: 'DELETE' });
}

export async function updateCredential(id, data) {
  return n8nFetch(`/credentials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Tags ---

export async function listTags() {
  return n8nFetch('/tags');
}

export async function createTag(name) {
  return n8nFetch('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateTag(id, name) {
  return n8nFetch(`/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteTag(id) {
  return n8nFetch(`/tags/${id}`, { method: 'DELETE' });
}

// --- Variables ---

export async function listVariables() {
  return n8nFetch('/variables');
}

export async function createVariable(key, value) {
  return n8nFetch('/variables', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
}

export async function updateVariable(id, data) {
  return n8nFetch(`/variables/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteVariable(id) {
  return n8nFetch(`/variables/${id}`, { method: 'DELETE' });
}

// --- Health Check ---

export async function healthCheck() {
  try {
    const result = await listWorkflows({ limit: 1 });
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
