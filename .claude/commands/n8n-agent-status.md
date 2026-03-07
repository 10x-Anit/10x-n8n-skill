---
description: "Show N8N Factory department pipeline status"
argument-hint: ""
---

CONTEXT: Display status of all 6 departments — queue, activity, failures.
REQUIRES: .n8n-track/agents.json, .n8n-track/handoffs/

STEPS:
1. READ .n8n-track/agents.json for department definitions
2. SCAN .n8n-track/handoffs/ for all ticket files
3. COUNT per department: pending, done, failed handoffs
4. OUTPUT table:

 #  Department     Duty                          Pending  Done  Failed
 1  Intelligence   Research nodes + doc URLs      <n>     <n>   <n>
 2  Design         Blueprint + connections        <n>     <n>   <n>
 3  Production     Build JSON + credentials       <n>     <n>   <n>
 4  Compliance     Validate before deploy         <n>     <n>   <n>
 5  Operations     Deploy + test execution        <n>     <n>   <n>
 6  Records        Checkpoint + tracking          <n>     <n>   <n>

Pipeline: Intelligence → Design → Production → Compliance → Operations → Records

5. IF any failed → show: `[<dept>] FAIL: <error message>`
6. SHOW recent activity from handoff timestamps

$ARGUMENTS
