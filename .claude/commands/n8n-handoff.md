---
description: "View and manage inter-department handoff tickets"
argument-hint: "[list|pick|complete|fail] [handoff-id]"
---

CONTEXT: Manage N8N Factory handoff queue between departments.
REQUIRES: .n8n-track/handoffs/

STEPS:
1. IF no args OR `list` → SCAN .n8n-track/handoffs/*.json
   OUTPUT table: Status | From | To | Task
2. IF `pick <id>` → set status=in_progress, set picked_at, show full ticket
3. IF `complete <id>` → set status=done, set done_at, create next handoff if hands_off_to defined
4. IF `fail <id> <reason>` → set status=failed, create retry handoff to hands_back_to_on_fail dept

RULES:
- Handoff file: .n8n-track/handoffs/ho-<timestamp>-<from>-to-<to>.json
- Every handoff has: task, context_refs, validation_report, payload
- Failed handoffs include exact error for the receiving department

$ARGUMENTS
