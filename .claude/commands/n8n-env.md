---
description: "View, set, or validate env vars for a project"
argument-hint: "<project-slug> [set <key> <value> | validate | generate]"
---

CONTEXT: projects/<slug>/.env + env.schema.json
REQUIRES: project slug exists in projects/

STEPS:
1. READ projects/<slug>/.env and env.schema.json
2. IF no args → display var table: Variable | Status (SET/MISSING) | Used By
3. IF `set <key> <value>` → update or append key in .env, confirm without echoing value
4. IF `validate` → check required vars present, validate known prefixes (xoxb-, sk-, http)
5. IF `generate` → analyze draft workflow, generate .env template preserving existing values
6. OUTPUT — table: `Variable | Status | Used By` + missing count

RULES:
- NEVER echo actual secret values — show only SET/MISSING
- .env files are in .gitignore — never commit them
- Validate known formats: Slack xoxb-/xoxp-, OpenAI sk-, URLs http(s)://
