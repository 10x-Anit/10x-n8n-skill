import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.claude');
const CONFIG_FILE = join(CONFIG_DIR, 'n8n-config.json');

/**
 * Read the n8n connection config from ~/.claude/n8n-config.json
 * @returns {object|null} Config object or null if not configured
 */
export function getConfig() {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save the n8n connection config to ~/.claude/n8n-config.json
 * @param {object} config - { mode, baseUrl, apiKey, label }
 */
export function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Delete the n8n connection config
 */
export function deleteConfig() {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
  }
}

/**
 * Get the base API URL from config
 * @returns {string|null} Base API URL (e.g. http://localhost:5678/api/v1)
 */
export function getApiBaseUrl() {
  const config = getConfig();
  if (!config) return null;
  const base = config.baseUrl.replace(/\/$/, '');
  return `${base}/api/v1`;
}

/**
 * Get the API key from config
 * @returns {string|null} API key
 */
export function getApiKey() {
  const config = getConfig();
  return config?.apiKey || null;
}

export const CONFIG_FILE_PATH = CONFIG_FILE;
