#!/usr/bin/env python3
"""Smart Finder — Source-backed node lookup. Uses extracted index + raw TS source for drill-down."""
import os, json, sys, re, subprocess, platform

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(R, "docs", "nodes", "node-index.json")
CAT = os.path.join(R, "docs", "nodes", "node-catalog.json")
TPL = os.path.join(R, "docs", "nodes", "workflow-template.json")
SRC = os.path.join(R, "docs", "nodes", "n8n-repo", "packages")

def _idx():
    with open(IDX, "r", encoding="utf-8") as f: return json.load(f)["nodes"]

def _cat():
    try:
        with open(CAT, "r", encoding="utf-8") as f: return json.load(f)
    except Exception: return {}

def node(name):
    """Find one node -> {type, version, category, displayName, source, credentials}"""
    idx = _idx()
    # Exact match
    if name in idx:
        d = idx[name]
        return {"ok": True, "key": name, "type": d["type"], "tv": d["version"],
                "cat": d.get("category"), "disp": d.get("displayName"),
                "cred": d.get("credentials"), "src": d.get("source")}
    # Fuzzy match: search by partial name or type suffix
    name_l = name.lower()
    for k, v in idx.items():
        if name_l in k.lower() or v.get("type", "").lower().endswith("." + name_l):
            return {"ok": True, "key": k, "type": v["type"], "tv": v["version"],
                    "cat": v.get("category"), "disp": v.get("displayName"),
                    "cred": v.get("credentials"), "src": v.get("source"), "fuzzy": True}
    return {"ok": False, "msg": f"'{name}' not found in index ({len(idx)} nodes)"}

def nodes(names):
    """Find multiple nodes -> compact map"""
    return {n: node(n) for n in names}

def search(query):
    """Search nodes by keyword in name, displayName, description, type"""
    idx = _idx()
    q = query.lower()
    results = []
    for k, v in idx.items():
        text = f"{k} {v.get('displayName','')} {v.get('description','')} {v.get('type','')}".lower()
        if q in text:
            results.append({"key": k, "type": v["type"], "tv": v["version"],
                           "disp": v.get("displayName"), "cat": v.get("category")})
    return results

def detail(name):
    """Get detailed params by reading the actual TypeScript source file"""
    info = node(name)
    if not info["ok"]: return info
    src_path = info.get("src")
    if not src_path: return {**info, "detail": "no source path"}

    # Determine base path
    if info["type"].startswith("@n8n/"):
        base = os.path.join(SRC, "@n8n", "nodes-langchain", "nodes")
    else:
        base = os.path.join(SRC, "nodes-base", "nodes")

    full_path = os.path.join(base, src_path)
    if not os.path.exists(full_path):
        return {**info, "detail": f"source file not found: {full_path}"}

    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
        src = f.read()

    # Extract properties section
    props = []
    for m in re.finditer(r"displayName:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"](\w+)['\"].*?type:\s*['\"](\w+)['\"]", src, re.DOTALL):
        props.append({"display": m.group(1), "name": m.group(2), "type": m.group(3)})

    # Extract credential references
    creds = list(set(re.findall(r"name:\s*['\"](\w+Api\w*)['\"]", src)))

    return {**info, "properties": props[:20], "credentials_found": creds}

def grep_source(pattern, node_name=None):
    """Grep the n8n source for a pattern — like rg but focused on node files"""
    if node_name:
        info = node(node_name)
        if info["ok"] and info.get("src"):
            base = os.path.join(SRC, "@n8n", "nodes-langchain", "nodes") if info["type"].startswith("@n8n/") else os.path.join(SRC, "nodes-base", "nodes")
            search_path = os.path.join(base, os.path.dirname(info["src"]))
        else:
            search_path = os.path.join(SRC, "nodes-base", "nodes")
    else:
        search_path = os.path.join(SRC, "nodes-base", "nodes")

    results = []
    for root, _, files in os.walk(search_path):
        for f in files:
            if not f.endswith(".ts"): continue
            fp = os.path.join(root, f)
            try:
                with open(fp, "r", encoding="utf-8", errors="ignore") as fh:
                    for i, line in enumerate(fh, 1):
                        if re.search(pattern, line, re.IGNORECASE):
                            results.append({"file": os.path.relpath(fp, SRC), "line": i, "text": line.strip()[:120]})
                            if len(results) >= 50: return results
            except Exception: pass
    return results

def ls_source(node_name=None):
    """List files in a node's source directory"""
    if node_name:
        info = node(node_name)
        if info["ok"] and info.get("src"):
            base = os.path.join(SRC, "@n8n", "nodes-langchain", "nodes") if info["type"].startswith("@n8n/") else os.path.join(SRC, "nodes-base", "nodes")
            dir_path = os.path.join(base, os.path.dirname(info["src"]))
        else:
            return {"error": f"Node '{node_name}' not found"}
    else:
        dir_path = os.path.join(SRC, "nodes-base", "nodes")

    files = []
    for root, dirs, fnames in os.walk(dir_path):
        for f in fnames:
            fp = os.path.join(root, f)
            files.append({"path": os.path.relpath(fp, dir_path), "size": os.path.getsize(fp)})
    return files

def template(keyword):
    """Find best matching workflow template"""
    try:
        with open(TPL, "r", encoding="utf-8") as f: t = json.load(f)
    except Exception: return {"ok": False, "msg": "template file not found"}
    ex = t.get("examples", {})
    kw = keyword.lower()
    if kw in ex: return {"ok": True, "key": kw, "data": ex[kw]}
    pmap = {"linear": "basic_linear", "branch": "if_branching", "if": "if_branching",
            "cred": "credential_attached", "webhook": "webhook_with_code",
            "ai": "ai_agent_chatbot", "agent": "ai_agent_chatbot",
            "error": "error_handling", "google": "google_sheets_sync",
            "sheet": "google_sheets_sync", "respond": "webhook_respond_custom"}
    for k, v in pmap.items():
        if k in kw and v in ex: return {"ok": True, "key": v, "data": ex[v]}
    for k, v in ex.items():
        if kw in v.get("_description", "").lower(): return {"ok": True, "key": k, "data": v}
    return {"ok": False, "available": list(ex.keys())}

def rules():
    """Get essential build rules"""
    c = _cat()
    return {"fields": ["id", "name", "type", "typeVersion", "position", "parameters"],
            "id": "uuid-v4", "pos": {"x0": 250, "dx": 200, "y0": 300, "dy": 100},
            "conn": c.get("_connection_rules", {}),
            "cred_fmt": '{ "<credType>": { "id": "<id>", "name": "<name>" } }',
            "settings": {"executionOrder": "v1"},
            "api": {"create": "POST /api/v1/workflows", "update": "PATCH /api/v1/workflows/:id",
                    "activate": "PATCH /api/v1/workflows/:id {active:true}",
                    "get": "GET /api/v1/workflows/:id", "creds": "POST /api/v1/credentials"}}

def ls():
    """List all nodes from index — compact"""
    idx = _idx()
    return [{"k": k, "type": v["type"], "tv": v["version"],
             "cred": v.get("credentials"), "cat": v.get("category")}
            for k, v in idx.items()]

def stats():
    """Node index stats"""
    idx = _idx()
    cats = {}
    for v in idx.values():
        c = v.get("category", "unknown")
        cats[c] = cats.get(c, 0) + 1
    return {"total": len(idx), "by_category": cats}
