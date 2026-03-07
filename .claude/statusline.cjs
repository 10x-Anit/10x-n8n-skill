#!/usr/bin/env node
// n8n Skill Plugin — Custom Statusline
// Extends standard statusline with n8n-specific rows:
//   Row 1: Action         | Git
//   Row 2: Model          | Dir
//   Row 3: Tokens         | Cost
//   Row 4: n8n Status     | Node Index
//   Row 5: Pipeline       | Last Build
//   Row 6: Session        | Context bar

'use strict';
const fs = require('fs');
const path = require('path');

setTimeout(() => process.exit(0), 1500);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try { if (input) render(JSON.parse(input)); } catch (e) {}
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
process.stdin.resume();

// ── Colors ──
const RST = '\x1b[0m', BOLD = '\x1b[1m', DIM = '\x1b[2m';
const CYAN = '\x1b[38;2;6;182;212m', PURPLE = '\x1b[38;2;168;85;247m';
const GREEN = '\x1b[38;2;34;197;94m', YELLOW = '\x1b[38;2;245;158;11m';
const RED = '\x1b[38;2;239;68;68m', ORANGE = '\x1b[38;2;251;146;60m';
const WHITE = '\x1b[38;2;228;228;231m', PINK = '\x1b[38;2;236;72;153m';
const BLUE = '\x1b[38;2;59;130;246m', TEAL = '\x1b[38;2;20;184;166m';
const SEP_C = '\x1b[38;2;55;55;62m', DIM_BAR = '\x1b[38;2;40;40;45m';
const MAGENTA = '\x1b[38;2;192;38;211m';

const S = `  ${SEP_C}\u2502${RST}  `;
const C1 = 44;

function rpad(s, w) {
  const plain = s.replace(/\x1b\[[0-9;]*m/g, '');
  return s + (plain.length < w ? ' '.repeat(w - plain.length) : '');
}
function fmtTok(n) {
  return n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}k` : `${n}`;
}

// ── n8n-specific data readers ──

function getN8nStatus() {
  const cfgPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'n8n-config.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    if (cfg.baseUrl) return { connected: true, url: cfg.baseUrl.replace(/https?:\/\//, '').replace(/\/$/, '') };
  } catch (e) {}
  return { connected: false, url: '' };
}

function getNodeIndex(projectDir) {
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(projectDir, 'docs', 'nodes', 'node-index.json'), 'utf8'));
    return { total: idx._count || 0, nodes: idx.nodes ? Object.keys(idx.nodes).length : 0 };
  } catch (e) { return { total: 0, nodes: 0 }; }
}

function getPipelineStatus(projectDir) {
  // Check handoff files to determine current pipeline stage
  const handoffDir = path.join(projectDir, '.n8n-track', 'handoffs');
  try {
    const files = fs.readdirSync(handoffDir).filter(f => f.endsWith('.json')).sort();
    if (files.length) {
      const last = JSON.parse(fs.readFileSync(path.join(handoffDir, files[files.length - 1]), 'utf8'));
      return last.to || last.stage || 'idle';
    }
  } catch (e) {}
  return 'idle';
}

function getLastBuild(projectDir) {
  const projDir = path.join(projectDir, 'projects');
  try {
    const projects = fs.readdirSync(projDir).filter(d => {
      try { return fs.statSync(path.join(projDir, d)).isDirectory(); } catch (e) { return false; }
    });
    if (projects.length) {
      // Get most recent by mtime
      let latest = projects[0], latestTime = 0;
      for (const p of projects) {
        try {
          const t = fs.statSync(path.join(projDir, p)).mtimeMs;
          if (t > latestTime) { latestTime = t; latest = p; }
        } catch (e) {}
      }
      // Check for meta.json
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(projDir, latest, 'meta.json'), 'utf8'));
        return meta.name || latest;
      } catch (e) { return latest; }
    }
  } catch (e) {}
  return 'none';
}

function getActivityLog(projectDir) {
  const logPath = path.join(projectDir, 'logs', 'activity.jsonl');
  try {
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(l => l);
    if (lines.length) {
      const last = JSON.parse(lines[lines.length - 1]);
      return { action: last.a || '?', status: last.s || '?', count: lines.length };
    }
  } catch (e) {}
  return { action: '-', status: '-', count: 0 };
}

function getActivity(transcriptPath) {
  if (!transcriptPath) return 'Idle';
  try {
    const stat = fs.statSync(transcriptPath);
    const readSize = Math.min(16384, stat.size);
    const buf = Buffer.alloc(readSize);
    const fd = fs.openSync(transcriptPath, 'r');
    fs.readSync(fd, buf, 0, readSize, Math.max(0, stat.size - readSize));
    fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n').filter(l => l.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.type === 'assistant' && Array.isArray(entry.message?.content)) {
          const toolUses = entry.message.content.filter(c => c.type === 'tool_use');
          if (toolUses.length) {
            const last = toolUses[toolUses.length - 1];
            const name = last.name;
            const inp = last.input || {};
            if (name === 'Task' && inp.subagent_type) {
              const desc = inp.description ? ': ' + inp.description.slice(0, 20) : '';
              return `Task(${inp.subagent_type}${desc})`;
            }
            if (name === 'Skill' && inp.skill) return `Skill(${inp.skill})`;
            return name;
          }
        }
      } catch (e) { continue; }
    }
  } catch (e) {}
  return 'Idle';
}

function getGitInfo(projectDir) {
  try {
    const gitHead = fs.readFileSync(path.join(projectDir, '.git', 'HEAD'), 'utf8').trim();
    const branch = gitHead.startsWith('ref: refs/heads/') ? gitHead.slice(16) : gitHead.slice(0, 7);
    try {
      const config = fs.readFileSync(path.join(projectDir, '.git', 'config'), 'utf8');
      const urlMatch = config.match(/\[remote "origin"\][^[]*url\s*=\s*(.+)/);
      if (urlMatch) {
        const ghMatch = urlMatch[1].trim().match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (ghMatch) return `${ghMatch[1]}/${ghMatch[2]}:${branch}`;
      }
    } catch (e) {}
    return branch;
  } catch (e) { return 'no-git'; }
}

// ── Render ──

function render(data) {
  const model = data.model?.display_name || 'unknown';
  const cwd = (data.workspace?.current_dir || data.cwd || '').replace(/\\/g, '/').replace(/\/\/+/g, '/');
  const parts = cwd.split('/').filter(Boolean);
  const dir = parts.length > 3 ? parts.slice(-3).join('/') : parts.length > 0 ? parts.join('/') : '~';

  const projectDir = (data.workspace?.project_dir || data.workspace?.current_dir || data.cwd || '').replace(/\\/g, '/');
  const gitInfo = getGitInfo(projectDir);
  const activity = getActivity(data.transcript_path);
  const actClr = activity === 'Idle' ? DIM_BAR : GREEN;

  // Tokens
  const totIn = data.context_window?.total_input_tokens || 0;
  const totOut = data.context_window?.total_output_tokens || 0;
  const tokTotal = fmtTok(totIn + totOut);

  // Cost
  const costRaw = data.cost?.total_cost_usd || 0;
  const cost = costRaw === 0 ? '$0.00' : costRaw < 0.01 ? `$${costRaw.toFixed(4)}` : `$${costRaw.toFixed(2)}`;

  // Context bar
  let pct = Math.floor(data.context_window?.used_percentage || 0);
  if (pct > 100) pct = 100;
  const ctxClr = pct > 90 ? RED : pct > 75 ? ORANGE : pct > 40 ? YELLOW : WHITE;
  const barW = 30;
  const filled = Math.min(Math.floor(pct * barW / 100), barW);
  const bar = ctxClr + '\u2588'.repeat(filled) + RST + DIM_BAR + '\u2591'.repeat(barW - filled) + RST;

  // Session duration
  const durMs = data.cost?.total_duration_ms || 0;
  const durMin = Math.floor(durMs / 60000);
  const durSec = Math.floor((durMs % 60000) / 1000);
  const duration = durMin > 0 ? `${durMin}m ${durSec}s` : `${durSec}s`;

  // n8n-specific data
  const n8n = getN8nStatus();
  const nodeIdx = getNodeIndex(projectDir);
  const pipeline = getPipelineStatus(projectDir);
  const lastBuild = getLastBuild(projectDir);
  const actLog = getActivityLog(projectDir);

  const n8nStatusClr = n8n.connected ? GREEN : RED;
  const n8nStatusTxt = n8n.connected ? `Connected (${n8n.url})` : 'Disconnected';

  const pipeClr = pipeline === 'idle' ? DIM_BAR : TEAL;
  const pipeMap = {
    intelligence: `${TEAL}Intel${RST}${DIM_BAR} > Design > Prod > QA > Ops > Rec${RST}`,
    design: `${DIM_BAR}Intel > ${RST}${TEAL}Design${RST}${DIM_BAR} > Prod > QA > Ops > Rec${RST}`,
    production: `${DIM_BAR}Intel > Design > ${RST}${TEAL}Prod${RST}${DIM_BAR} > QA > Ops > Rec${RST}`,
    compliance: `${DIM_BAR}Intel > Design > Prod > ${RST}${YELLOW}QA${RST}${DIM_BAR} > Ops > Rec${RST}`,
    operations: `${DIM_BAR}Intel > Design > Prod > QA > ${RST}${ORANGE}Ops${RST}${DIM_BAR} > Rec${RST}`,
    records: `${DIM_BAR}Intel > Design > Prod > QA > Ops > ${RST}${GREEN}Rec${RST}`,
    idle: `${DIM_BAR}Idle${RST}`
  };
  const pipeDisplay = pipeMap[pipeline] || `${pipeClr}${pipeline}${RST}`;

  // Build output
  let out = '';

  // Row 1: Action | Git
  out += ' ' + rpad(`${actClr}Action:${RST} ${actClr}${activity}${RST}`, C1) + S + `${WHITE}Git:${RST} ${WHITE}${gitInfo}${RST}\n`;

  // Row 2: Model | Dir
  out += ' ' + rpad(`${PURPLE}Model:${RST} ${PURPLE}${BOLD}${model}${RST}`, C1) + S + `${CYAN}Dir:${RST} ${CYAN}${dir}${RST}\n`;

  // Row 3: Tokens | Cost
  out += ' ' + rpad(`${YELLOW}Tokens:${RST} ${YELLOW}${fmtTok(totIn)} in + ${fmtTok(totOut)} out = ${BOLD}${tokTotal}${RST}`, C1) + S + `${GREEN}Cost:${RST} ${GREEN}${cost}${RST}\n`;

  // Row 4: n8n Status | Node Index
  out += ' ' + rpad(`${MAGENTA}n8n:${RST} ${n8nStatusClr}${n8nStatusTxt}${RST}`, C1) + S + `${TEAL}Nodes:${RST} ${TEAL}${nodeIdx.total} indexed${RST} ${DIM_BAR}(source-verified)${RST}\n`;

  // Row 5: Pipeline | Last Build
  out += ' ' + rpad(`${TEAL}Pipeline:${RST} ${pipeDisplay}`, C1) + S + `${PINK}Build:${RST} ${PINK}${lastBuild}${RST} ${DIM_BAR}(${actLog.count} actions)${RST}\n`;

  // Row 6: Session | Context bar
  out += ' ' + rpad(`${BLUE}Session:${RST} ${BLUE}${duration}${RST}`, C1) + S + `${ctxClr}Context:${RST} ${bar} ${ctxClr}${pct}%${RST}`;

  process.stdout.write(out);
}
