# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-22

### Added
- Official Claude Code agentic structure: everything under `.claude/`
- 6 agent `.md` files in `.claude/agents/` (intelligence, design, production, compliance, operations, records)
- `.mcp.json` for n8n MCP server configuration
- Plugin manifest now declares commands, skills, agents, and MCP paths

### Changed
- Moved `commands/` → `.claude/commands/` (official plugin layout)
- Moved `skills/` → `.claude/skills/` (official plugin layout)
- `lib/agents.js` now reads agent definitions from `.claude/agents/*.md` with YAML frontmatter
- Updated `.claude-plugin/plugin.json` with component path declarations
- Updated `.npmignore` to allow `.claude/` content while excluding local settings
- Package version bumped to 2.1.0

### Removed
- `.n8n-track/agents.json` (agents now in `.claude/agents/` as proper Claude Code agent files)

## [2.0.0] - 2025-02-22

### Added
- Official Claude Code plugin format (`.claude-plugin/plugin.json`)
- 5 composed skills: `n8n-factory`, `n8n-lifecycle`, `n8n-onboard`, `n8n-diagnose`, `n8n-evolve`
- N8N Factory 6-department pipeline: Intelligence, Design, Production, Compliance, Operations, Records
- Dynamic node discovery from n8n instance (`/n8n-discover`)
- Self-updating documentation system (`/n8n-update-docs`)
- `doc-links.json` with 50+ node type → official doc URL mappings
- `doc_url` field on every node in `node-catalog.json`
- OpenCode compatibility (auto-installs to `~/.config/opencode/commands/`)
- Cross-model universal instruction format
- Project isolation with version safety (original → draft → checkpoint → publish)
- Git-like tracking engine (branches, commits, diffs, execution logs)
- Token-efficient context indexing (file:line → semantic tags)
- Credential management via `.env` files
- `exports` field in package.json for programmatic access to all modules

### Changed
- All 41 commands rewritten to universal CONTEXT/STEPS/RULES format
- Average command size reduced from ~70 lines to ~30 lines (55% token reduction)
- Agent system renamed from generic roles to N8N Factory departments
- Package version bumped to 2.0.0

## [1.0.0] - 2025-02-22

### Added
- Initial release
- 41 slash commands for n8n management
- n8n REST API wrapper (workflows, executions, credentials, tags, variables)
- Connection management (cloud + self-hosted)
- Local n8n installation guide (Docker + npm)
- Node catalog with 20+ pre-documented nodes
- 7 workflow patterns
- CLI tool (`10x-n8n`)
