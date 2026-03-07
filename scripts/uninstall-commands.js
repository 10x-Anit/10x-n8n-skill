import { existsSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const COMMANDS_SRC = join(ROOT, '.claude', 'commands');
const SKILLS_SRC = join(ROOT, '.claude', 'skills');
const COMMANDS_DEST = join(homedir(), '.claude', 'commands');

const OPENCODE_DIRS = [
  join(homedir(), '.config', 'opencode', 'commands'),
  join(homedir(), '.opencode', 'commands'),
];

try {
  let removed = 0;
  const srcFiles = readdirSync(COMMANDS_SRC).filter((f) => f.endsWith('.md'));

  // Remove atomic commands
  for (const file of srcFiles) {
    const dest = join(COMMANDS_DEST, file);
    if (existsSync(dest)) { unlinkSync(dest); removed++; }
  }

  // Remove skill files (installed as skill-<name>.md)
  if (existsSync(SKILLS_SRC)) {
    for (const dir of readdirSync(SKILLS_SRC, { withFileTypes: true }).filter(d => d.isDirectory())) {
      const dest = join(COMMANDS_DEST, `${dir.name}.md`);
      if (existsSync(dest)) { unlinkSync(dest); removed++; }
    }
  }

  // Remove from OpenCode dirs
  for (const ocDir of OPENCODE_DIRS) {
    if (existsSync(ocDir)) {
      for (const file of srcFiles) {
        const dest = join(ocDir, file);
        if (existsSync(dest)) { unlinkSync(dest); removed++; }
      }
    }
  }

  console.log(`10x-n8n-skill: Removed ${removed} files`);
} catch (err) {
  console.warn(`10x-n8n-skill: Could not remove commands: ${err.message}`);
}
