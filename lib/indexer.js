import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const TRACK_DIR = join(process.cwd(), '.n8n-track');
const CONTEXT_MAP = join(TRACK_DIR, 'index', 'context-map.json');
const LINE_INDEX = join(TRACK_DIR, 'index', 'line-index.json');

// --- Context Map ---

function readJSON(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Index a file: scan content and map line ranges to semantic tags.
 * Returns entries like: { "docs/file.md:15-28": ["api", "workflow", "create"] }
 */
export function indexFile(filePath, basePath) {
  if (!existsSync(filePath)) return {};

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = filePath.replace(basePath + '/', '').replace(basePath + '\\', '');
  const entries = {};

  let sectionStart = 1;
  let sectionTags = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Detect markdown headers as section boundaries
    const headerMatch = line.match(/^#{1,4}\s+(.+)/);
    if (headerMatch) {
      // Save previous section
      if (inSection && sectionTags.length > 0) {
        const key = `${relativePath}:${sectionStart}-${lineNum - 1}`;
        entries[key] = sectionTags;
      }
      // Start new section
      sectionStart = lineNum;
      sectionTags = extractTags(headerMatch[1]);
      inSection = true;
    }

    // Detect code blocks with API endpoints
    const endpointMatch = line.match(/(GET|POST|PUT|PATCH|DELETE)\s+\/(api\/v1\/\S+|[\w/-]+)/);
    if (endpointMatch) {
      sectionTags.push(endpointMatch[1].toLowerCase());
      sectionTags.push(...endpointMatch[2].split('/').filter(Boolean));
    }

    // Detect JSON keys in workflow snapshots
    if (line.match(/"type"\s*:\s*"n8n-nodes-base\.\w+"/)) {
      const nodeType = line.match(/"n8n-nodes-base\.(\w+)"/);
      if (nodeType) sectionTags.push(nodeType[1]);
    }
  }

  // Save final section
  if (inSection && sectionTags.length > 0) {
    const key = `${relativePath}:${sectionStart}-${lines.length}`;
    entries[key] = [...new Set(sectionTags)];
  }

  return entries;
}

/**
 * Extract semantic tags from a header string.
 */
function extractTags(header) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'on', 'of', 'with', 'by', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'shall', 'may', 'might', 'must', 'can', 'could', 'would', 'should', 'this', 'that', 'it',
    'from', 'at', 'as', 'not', 'no', 'if', 'then', 'else', 'when', 'how', 'what', 'which',
    'who', 'where', 'why', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  ]);

  return header
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
    .slice(0, 6);
}

/**
 * Rebuild the full context map by scanning docs/ and snapshots/.
 */
export function rebuildIndex(projectRoot) {
  const entries = {};
  const docsDir = join(projectRoot, 'docs');
  const snapshotsDir = join(projectRoot, '.n8n-track', 'snapshots');

  // Index docs
  if (existsSync(docsDir)) {
    for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md'))) {
      const fileEntries = indexFile(join(docsDir, file), projectRoot);
      Object.assign(entries, fileEntries);
    }
  }

  // Index snapshots
  if (existsSync(snapshotsDir)) {
    for (const wfDir of readdirSync(snapshotsDir)) {
      const wfPath = join(snapshotsDir, wfDir);
      for (const snap of readdirSync(wfPath).filter((f) => f.endsWith('.json'))) {
        const fileEntries = indexFile(join(wfPath, snap), projectRoot);
        Object.assign(entries, fileEntries);
      }
    }
  }

  // Build context map
  const contextMap = {
    version: 1,
    generated_at: new Date().toISOString(),
    files: {},
    symbols: {},
    refs: entries,
  };

  // Build inverted index: tag → [file:line references]
  const symbols = {};
  for (const [ref, tags] of Object.entries(entries)) {
    for (const tag of tags) {
      if (!symbols[tag]) symbols[tag] = [];
      symbols[tag].push(ref);
    }
  }
  contextMap.symbols = symbols;

  // Count files indexed
  const fileSet = new Set();
  for (const ref of Object.keys(entries)) {
    fileSet.add(ref.split(':')[0]);
  }
  for (const file of fileSet) {
    contextMap.files[file] = { sections: Object.keys(entries).filter((r) => r.startsWith(file)).length };
  }

  writeJSON(CONTEXT_MAP, contextMap);

  // Build line index (flat lookup)
  writeJSON(LINE_INDEX, {
    version: 1,
    description: 'Maps file:line_range to semantic tags for token-efficient context loading',
    entries,
  });

  return {
    files_indexed: fileSet.size,
    sections_indexed: Object.keys(entries).length,
    unique_tags: Object.keys(symbols).length,
  };
}

/**
 * Query the context index for a topic.
 * Returns file:line references sorted by relevance (number of matching tags).
 */
export function queryContext(tags) {
  const contextMap = readJSON(CONTEXT_MAP);
  if (!contextMap) return [];

  const queryTags = Array.isArray(tags) ? tags : tags.toLowerCase().split(/\s+/);
  const scores = {};

  for (const tag of queryTags) {
    const refs = contextMap.symbols[tag] || [];
    for (const ref of refs) {
      scores[ref] = (scores[ref] || 0) + 1;
    }
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([ref, score]) => ({
      ref,
      score,
      tags: contextMap.refs[ref] || [],
    }));
}

/**
 * Get the exact line range to read for a context reference.
 * Input: "docs/n8n-api-workflows.md:15-28"
 * Output: { file: "docs/n8n-api-workflows.md", start: 15, end: 28 }
 */
export function parseRef(ref) {
  const [file, range] = ref.split(':');
  if (!range) return { file, start: 1, end: null };
  const [start, end] = range.split('-').map(Number);
  return { file, start, end: end || start };
}
