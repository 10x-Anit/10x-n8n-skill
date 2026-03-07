# Handoff Queue

Each `.json` file in this directory is a handoff ticket between agents.

## File naming: `{timestamp}-{from_agent}-to-{to_agent}.json`

## Structure:
```json
{
  "id": "handoff-{timestamp}",
  "from": "architect",
  "to": "builder",
  "status": "pending|in_progress|done|failed",
  "task": "Single line task description",
  "context_refs": ["file:line-line", ...],
  "payload": {},
  "created_at": "ISO timestamp",
  "picked_at": null,
  "done_at": null
}
```

Agents poll this directory for tickets addressed to them.
After completion, agent updates status and optionally creates a new handoff for the next agent.
