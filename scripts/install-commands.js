import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const COMMANDS_SRC = join(ROOT, '.claude', 'commands');
const SKILLS_SRC = join(ROOT, '.claude', 'skills');
const CLAUDE_DIR = join(homedir(), '.claude');
const COMMANDS_DEST = join(CLAUDE_DIR, 'commands');

// Also check for OpenCode config dirs
const OPENCODE_DIRS = [
  join(homedir(), '.config', 'opencode', 'commands'),
  join(homedir(), '.opencode', 'commands'),
];

try {
  let copied = 0;

  // --- Install atomic commands to ~/.claude/commands/ ---
  if (!existsSync(COMMANDS_DEST)) {
    mkdirSync(COMMANDS_DEST, { recursive: true });
  }

  const cmdFiles = readdirSync(COMMANDS_SRC).filter((f) => f.endsWith('.md'));
  for (const file of cmdFiles) {
    copyFileSync(join(COMMANDS_SRC, file), join(COMMANDS_DEST, file));
    copied++;
  }

  // --- Install to OpenCode if config dir exists ---
  for (const ocDir of OPENCODE_DIRS) {
    const parent = dirname(ocDir);
    if (existsSync(parent)) {
      if (!existsSync(ocDir)) mkdirSync(ocDir, { recursive: true });
      for (const file of cmdFiles) {
        copyFileSync(join(COMMANDS_SRC, file), join(ocDir, file));
      }
      console.log(`  + OpenCode commands: ${ocDir}`);
    }
  }

  // --- Install composed skills to ~/.claude/commands/ (as flat .md files) ---
  // Skills get prefixed with their directory name so they don't collide with atomic commands
  if (existsSync(SKILLS_SRC)) {
    const skillDirs = readdirSync(SKILLS_SRC, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const dir of skillDirs) {
      const skillFile = join(SKILLS_SRC, dir.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        // Skills go into commands/ as skill-<name>.md for flat compatibility
        const destFile = join(COMMANDS_DEST, `${dir.name}.md`);
        copyFileSync(skillFile, destFile);
        copied++;
      }
    }
  }

  console.log(`10x-n8n-skill: Installed ${copied} commands + skills to ${COMMANDS_DEST}`);

  // Show what was installed
  console.log(`  Commands: ${cmdFiles.length} atomic operations`);
  if (existsSync(SKILLS_SRC)) {
    const skillCount = readdirSync(SKILLS_SRC, { withFileTypes: true })
      .filter((d) => d.isDirectory()).length;
    console.log(`  Skills: ${skillCount} composed workflows`);
  }
} catch (err) {
  console.warn(`10x-n8n-skill: Could not install commands: ${err.message}`);
}
