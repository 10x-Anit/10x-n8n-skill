# Project Folder Template

When a new workflow is created or imported, this structure is replicated:

```
projects/<workflow-slug>/
├── meta.json              ← Workflow metadata, n8n ID, status, description
├── .env                   ← User's secrets for this workflow (API keys, tokens)
├── env.schema.json        ← What env vars this workflow needs + descriptions
├── original/              ← The "known-good" version imported from n8n
│   └── workflow.json      ← Exact copy from n8n API at import time
├── draft/                 ← Working copy being modified
│   └── workflow.json      ← Current draft with changes
├── checkpoints/           ← Saved versions confirmed working by user
│   └── v1.json            ← checkpoint after first successful publish
│   └── v2.json            ← checkpoint after second change
├── credentials/           ← Credential mappings for this workflow
│   └── cred-map.json      ← Maps node → credential type → env var
└── history.jsonl          ← Local change log for this workflow
```

## Lifecycle

1. `/n8n-new` → creates project folder, builds workflow via API, saves as original
2. `/n8n-import` → pulls existing workflow from n8n, saves as original
3. Modification → copies original to draft/, makes changes in draft
4. `/n8n-checkpoint` → user confirms draft works → saves as checkpoint vN
5. `/n8n-publish` → pushes draft to n8n API, saves checkpoint, updates original
6. `/n8n-rollback` → restores a checkpoint as the draft, optionally publishes
