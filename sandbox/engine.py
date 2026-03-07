#!/usr/bin/env python3
"""
n8n Skill Engine — Single entry point for all sandbox operations.
Claude calls: python sandbox/engine.py <command> [args]

Commands:
  find <node1,node2,...>        — Lookup nodes (type, version, cred) from source index
  search <query>                — Search nodes by keyword
  detail <node>                 — Get detailed params from TypeScript source
  grep <pattern> [node]         — Grep n8n source files for a pattern
  ls [node]                     — List files in node's source directory
  template <keyword>            — Get matching workflow template
  rules                         — Get build rules (connections, creds, API)
  build <spec.json> [out.json]  — Build workflow from spec
  validate <workflow.json>      — Validate workflow JSON
  list                          — List all available nodes (546+)
  stats                         — Show index stats
  recall <action-name>          — Check if we did this before
  history [n]                   — Show recent activity
  extract [repo] [out]          — Re-extract index from n8n source repo
  example                       — Print example spec
"""
import sys, json, os

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R, "sandbox"))

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "init":
        from setup import run; run()

    elif cmd == "find":
        from finder import nodes
        names = sys.argv[2].split(",") if len(sys.argv) > 2 else []
        print(json.dumps(nodes(names), indent=2, default=str))

    elif cmd == "search":
        from finder import search
        results = search(sys.argv[2] if len(sys.argv) > 2 else "")
        print(json.dumps(results, indent=2, default=str))

    elif cmd == "detail":
        from finder import detail
        print(json.dumps(detail(sys.argv[2] if len(sys.argv) > 2 else ""), indent=2, default=str))

    elif cmd == "grep":
        from finder import grep_source
        pattern = sys.argv[2] if len(sys.argv) > 2 else ""
        node_name = sys.argv[3] if len(sys.argv) > 3 else None
        print(json.dumps(grep_source(pattern, node_name), indent=2, default=str))

    elif cmd == "ls":
        from finder import ls_source
        node_name = sys.argv[2] if len(sys.argv) > 2 else None
        print(json.dumps(ls_source(node_name), indent=2, default=str))

    elif cmd == "template":
        from finder import template
        print(json.dumps(template(sys.argv[2] if len(sys.argv) > 2 else "linear"), indent=2, default=str))

    elif cmd == "rules":
        from finder import rules
        print(json.dumps(rules(), indent=2))

    elif cmd == "build":
        from builder import build, save_wf
        spec = json.load(open(sys.argv[2], "r", encoding="utf-8"))
        wf = build(spec["name"], spec["nodes"], spec["connections"])
        if len(sys.argv) > 3:
            save_wf(wf, sys.argv[3])
            print(json.dumps({"status": "saved", "path": sys.argv[3], "nodes": len(wf["nodes"]),
                              "issues": wf.get("_issues", [])}, indent=2))
        else:
            print(json.dumps(wf, indent=2))

    elif cmd == "validate":
        from builder import validate
        wf = json.load(open(sys.argv[2], "r", encoding="utf-8"))
        issues = validate(wf)
        print(json.dumps({"valid": len(issues) == 0, "issues": issues}, indent=2))

    elif cmd == "list":
        from finder import ls
        for n in ls():
            print(f"  {n['k']:25s} {n['type']:50s} tv={n['tv']}  cred={n['cred'] or '-'}")

    elif cmd == "stats":
        from finder import stats
        print(json.dumps(stats(), indent=2))

    elif cmd == "recall":
        from logger import recall
        r = recall(sys.argv[2] if len(sys.argv) > 2 else "")
        print(json.dumps(r, indent=2, default=str) if r else "Not found")

    elif cmd == "history":
        from logger import recent
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        for e in recent(n): print(json.dumps(e))

    elif cmd == "extract":
        from extractor import main as extract_main
        extract_main()

    elif cmd == "example":
        print(json.dumps({"name": "Example", "nodes": [
            {"key": "webhook", "name": "Webhook", "params": {"httpMethod": "POST", "path": "test", "responseMode": "onReceived"}},
            {"key": "set", "name": "Set Data", "params": {"mode": "manual", "assignments": {"assignments": [{"id": "a1", "name": "msg", "value": "hello", "type": "string"}]}}},
            {"key": "slack", "name": "Notify", "params": {"resource": "message", "operation": "send", "channel": "#test", "text": "={{ $json.msg }}"},
             "credentials": {"slackApi": {"id": "ID", "name": "Slack"}}}
        ], "connections": [{"from": "Webhook", "to": "Set Data"}, {"from": "Set Data", "to": "Notify"}]}, indent=2))

    else:
        print(f"Unknown command: {cmd}. Run without args for help.")

if __name__ == "__main__":
    main()
