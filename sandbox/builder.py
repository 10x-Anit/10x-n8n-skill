#!/usr/bin/env python3
"""Workflow Builder — Programmatically builds valid n8n JSON from specs. Zero hallucination."""
import os, json, sys, uuid

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R,"sandbox"))
from finder import node as find_node, rules as get_rules
from logger import log, save

def build(name, node_specs, conn_specs):
    """
    Build complete workflow JSON.
    node_specs: [{"key":"webhook","name":"My Webhook","params":{...},"credentials":{...}}]
    conn_specs: [{"from":"My Webhook","to":"Process"}]  or  [{"from":"IF","to":["True","False"]}]
    """
    r = get_rules()
    nodes, conns = [], {}
    x0, dx, y0 = r["pos"]["x0"], r["pos"]["dx"], r["pos"]["y0"]

    for i, s in enumerate(node_specs):
        info = find_node(s["key"])
        if not info["ok"]:
            raise ValueError(f"Node '{s['key']}' not in catalog")
        n = {"id":str(uuid.uuid4()), "name":s.get("name",s["key"]),
             "type":info["type"], "typeVersion":info["tv"],
             "position":[s.get("x", x0+i*dx), s.get("y", y0)],
             "parameters":s.get("params",{})}
        if s.get("credentials"): n["credentials"] = s["credentials"]
        nodes.append(n)

    names = [n["name"] for n in nodes]
    for c in conn_specs:
        src = c["from"]
        tgts = c["to"] if isinstance(c["to"], list) else [c["to"]]
        if src not in conns: conns[src] = {"main":[]}
        for idx, t in enumerate(tgts):
            ts = [t] if isinstance(t, str) else t
            while len(conns[src]["main"]) <= idx: conns[src]["main"].append([])
            conns[src]["main"][idx] = [{"node":tt,"type":"main","index":0} for tt in ts]

    wf = {"name":name,"nodes":nodes,"connections":conns,"settings":r["settings"]}
    issues = validate(wf)
    log("build", "ok" if not issues else "warn", name, [s["key"] for s in node_specs])
    if not issues:
        save(f"wf:{name}", json.dumps(node_specs), [s["key"] for s in node_specs])
    if issues: wf["_issues"] = issues
    return wf

def validate(wf):
    """Validate workflow JSON. Returns issues list (empty=valid)."""
    issues = []
    nodes = wf.get("nodes",[])
    conns = wf.get("connections",{})
    names = [n["name"] for n in nodes]

    for n in nodes:
        for f in ["id","name","type","typeVersion","position","parameters"]:
            if f not in n: issues.append(f"{n.get('name','?')} missing {f}")
    if not wf.get("settings",{}).get("executionOrder"):
        issues.append("Missing settings.executionOrder")
    trigger_types = ["webhook","trigger","manualTrigger","scheduleTrigger","errorTrigger","n8nTrigger","chatTrigger","formTrigger","emailReadImap","localFileTrigger","manualChatTrigger"]
    triggers = [n for n in nodes if any(t in n.get("type","").lower() for t in trigger_types)]
    if len(triggers) != 1:
        issues.append(f"Need exactly 1 trigger, found {len(triggers)}")
    if len(names) != len(set(names)):
        issues.append("Duplicate node names")
    targets = {t["node"] for cd in conns.values() for o in cd.get("main",[]) for t in o}
    for src in conns:
        if src not in names: issues.append(f"Connection source '{src}' not in nodes")
    for t in targets:
        if t not in names: issues.append(f"Connection target '{t}' not in nodes")
    for n in nodes:
        is_trigger = any(t in n.get("type","").lower() for t in trigger_types)
        if n["name"] not in targets and not is_trigger:
            issues.append(f"Orphan: {n['name']}")
    return issues

def save_wf(wf, path):
    with open(path,"w",encoding="utf-8") as f: json.dump(wf,f,indent=2,ensure_ascii=False)
    log("save","ok",path)

if __name__=="__main__":
    if len(sys.argv)<2:
        print("Usage: builder.py build <spec.json> [out.json] | validate <wf.json> | example"); sys.exit(1)
    cmd=sys.argv[1]
    if cmd=="example":
        print(json.dumps({"name":"Example","nodes":[
            {"key":"webhook","name":"Webhook","params":{"httpMethod":"POST","path":"test","responseMode":"onReceived"}},
            {"key":"set","name":"Set","params":{"mode":"manual","assignments":{"assignments":[{"id":"a1","name":"msg","value":"hello","type":"string"}]}}},
            {"key":"slack","name":"Notify","params":{"resource":"message","operation":"send","channel":"#test","text":"={{ $json.msg }}"},
             "credentials":{"slackApi":{"id":"ID","name":"Slack"}}}
        ],"connections":[{"from":"Webhook","to":"Set"},{"from":"Set","to":"Notify"}]},indent=2))
    elif cmd=="build":
        spec=json.load(open(sys.argv[2],"r",encoding="utf-8"))
        wf=build(spec["name"],spec["nodes"],spec["connections"])
        if len(sys.argv)>3: save_wf(wf,sys.argv[3]); print(f"Saved: {sys.argv[3]}")
        else: print(json.dumps(wf,indent=2))
    elif cmd=="validate":
        wf=json.load(open(sys.argv[2],"r",encoding="utf-8"))
        issues=validate(wf)
        print("PASS" if not issues else "FAIL:\n"+"\n".join(f"  - {i}" for i in issues))
