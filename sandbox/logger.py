#!/usr/bin/env python3
"""Activity logger — append-only log + evolving actions reference."""
import os, json, datetime as dt

L = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(L, exist_ok=True)
ACT = os.path.join(L, "activity.jsonl")
REF = os.path.join(L, "actions.json")

def log(action, status="ok", detail=None, nodes=None):
    e = {"a":action,"s":status,"t":dt.datetime.now().isoformat()}
    if detail: e["d"] = detail
    if nodes: e["n"] = nodes
    with open(ACT,"a") as f: f.write(json.dumps(e)+"\n")
    return e

def save(name, approach, nodes=None):
    ref = json.load(open(REF)) if os.path.exists(REF) else {"_v":1}
    ref[name] = {"code":approach, "nodes":nodes or [], "t":dt.datetime.now().isoformat(),
                 "uses": ref.get(name,{}).get("uses",0)+1}
    json.dump(ref, open(REF,"w"), indent=2)

def recall(name):
    if not os.path.exists(REF): return None
    return json.load(open(REF)).get(name)

def recent(n=10):
    if not os.path.exists(ACT): return []
    lines = open(ACT).readlines()[-n:]
    return [json.loads(l) for l in lines if l.strip()]
