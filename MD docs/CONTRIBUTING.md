# Contributing to 10x-n8n-skill

## Quick Start

```bash
git clone https://github.com/10x-Anit/10x-n8n-skill.git
cd 10x-n8n-skill
npm install
```

Test locally with Claude Code:
```bash
claude --plugin-dir ./
```

## Project Structure

```
commands/        → 41 atomic .md commands (1 file = 1 action)
skills/          → 5 composed SKILL.md workflows (chain commands)
lib/             → JS modules (API, tracking, agents, indexer)
docs/            → Reference files (n8n API docs, node catalog)
.n8n-track/      → Tracking engine templates
scripts/         → Install/uninstall scripts
```

## Writing Commands

All commands use the universal format:

```markdown
---
description: "One-line description"
argument-hint: "expected args"
---

CONTEXT: What this does in 1 line.
REQUIRES: What must exist before this runs.

STEPS:
1. ACTION — one action per step
2. IF condition → do this | ELSE → do that
3. EXECUTE — exact API call or file operation
4. VERIFY — check the result
5. OUTPUT — exact format the user sees

RULES:
- Hard constraint (max 5 rules)

REFERENCE: file paths for lookups
```

### Rules for command writing:
- No paragraphs or explanations
- Every line is a step, rule, reference, or output template
- Max 50 lines per command
- 1 step = 1 action (imperative verb)
- Use `$ARGUMENTS` for user input
- Always reference `docs/nodes/node-catalog.json` for node operations

## Writing Composed Skills

Skills go in `skills/<name>/SKILL.md`. They chain multiple commands:

```markdown
---
description: "What this composed workflow does"
argument-hint: "args"
allowed-tools: "Read, Write, Bash(curl *)"
---

CONTEXT: High-level orchestration description.

STEPS:
1. RUN /n8n-connect logic: ...
2. RUN /n8n-new logic: ...
3. RUN /n8n-publish logic: ...
```

Skills should reference commands by name, not duplicate their content.

## Adding Nodes to the Catalog

Edit `docs/nodes/node-catalog.json`:

```json
"myNode": {
  "type": "n8n-nodes-base.myNode",
  "category": "integration",
  "doc_url": "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mynode/",
  "params": {
    "resource": { "type": "enum", "values": ["item", "list"] },
    "operation": { "type": "enum", "depends_on": "resource" }
  },
  "credentials": "myNodeApi",
  "env_vars": ["MY_NODE_API_KEY"],
  "outputs": 1
}
```

Also add to `docs/nodes/doc-links.json` and `lib/credentials.js` NODE_CREDENTIAL_MAP.

## Testing

```bash
# Test CLI
node lib/cli.js status

# Test with a local n8n instance
10x-Anit-n8n connect self-hosted http://localhost:5678 <api-key>
10x-Anit-n8n status
```

## Pull Request Guidelines

1. One feature or fix per PR
2. Commands must follow the universal format
3. New nodes must have `doc_url` in catalog
4. No duplicate content between commands/ and skills/
5. Test with both small model prompts and large model prompts
