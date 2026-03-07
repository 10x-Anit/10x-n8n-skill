#!/usr/bin/env python3
"""Extract node metadata from n8n source repo -> compact JSON index.
Usage: python sandbox/extractor.py [repo_path] [output_path]
Defaults: docs/nodes/n8n-repo  ->  docs/nodes/node-index.json
"""
import os, sys, re, json

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, "docs", "nodes", "n8n-repo")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, "docs", "nodes", "node-index.json")

def extract_from_ts(path):
    """Extract name, displayName, type, version, description, credentials from a .node.ts file."""
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        src = f.read()

    info = {}

    # defaultVersion (versioned nodes) — highest priority
    m = re.search(r"defaultVersion:\s*([\d.]+)", src)
    if m:
        info["version"] = float(m.group(1)) if "." in m.group(1) else int(m.group(1))

    # version array or single (non-versioned)
    if "version" not in info:
        m = re.search(r"version:\s*\[([\d.,\s]+)\]", src)
        if m:
            versions = [float(v.strip()) if "." in v.strip() else int(v.strip()) for v in m.group(1).split(",")]
            info["version"] = max(versions)
        else:
            m = re.search(r"version:\s*(\d+(?:\.\d+)?)", src)
            if m:
                info["version"] = float(m.group(1)) if "." in m.group(1) else int(m.group(1))

    # name
    m = re.search(r"name:\s*['\"](\w+)['\"]", src)
    if m:
        info["name"] = m.group(1)

    # displayName
    m = re.search(r"displayName:\s*['\"]([^'\"]+)['\"]", src)
    if m:
        info["displayName"] = m.group(1)

    # description
    m = re.search(r"description:\s*['\"]([^'\"]+)['\"]", src)
    if m:
        info["description"] = m.group(1)

    # group
    m = re.search(r"group:\s*\[([^\]]+)\]", src)
    if m:
        info["group"] = [g.strip().strip("'\"") for g in m.group(1).split(",")]

    # credentials
    creds = re.findall(r"name:\s*['\"](\w+Api\w*|imap|httpBasicAuth|httpHeaderAuth|oAuth2Api|httpDigestAuth)['\"]", src)
    if creds:
        info["credentials"] = list(set(creds))

    # hidden
    if "hidden: true" in src:
        info["hidden"] = True

    # depth = how deep from the node root (for priority)
    info["_depth"] = path.count(os.sep)

    return info

def scan_nodes(base_path, prefix="n8n-nodes-base", cat_override=None):
    """Scan all node directories and extract metadata."""
    index = {}
    for root, dirs, files in os.walk(base_path):
        for f in files:
            if f.endswith(".node.ts") and not f.startswith("__"):
                path = os.path.join(root, f)
                try:
                    info = extract_from_ts(path)
                    if "name" not in info or "version" not in info:
                        continue

                    name = info["name"]
                    type_str = f"{prefix}.{name}"
                    info["type"] = type_str

                    if cat_override:
                        info["category"] = cat_override
                    elif info.get("group") and "trigger" in info["group"]:
                        info["category"] = "trigger"
                    else:
                        info["category"] = "node"

                    info["source"] = os.path.relpath(path, base_path).replace("\\", "/")

                    # Only keep if: not yet seen, OR this is a shallower (root-level) file
                    existing = index.get(name)
                    if not existing or info["_depth"] < existing["_depth"]:
                        index[name] = info
                except Exception:
                    pass

    # Clean up internal fields
    for v in index.values():
        v.pop("_depth", None)

    return index

def main():
    print(f"Scanning: {REPO}")
    base = os.path.join(REPO, "packages", "nodes-base", "nodes")
    langchain_parent = os.path.join(REPO, "packages", "@n8n")
    langchain = None
    if os.path.isdir(langchain_parent):
        for d in os.listdir(langchain_parent):
            if "langchain" in d.lower():
                langchain = os.path.join(langchain_parent, d, "nodes")
                break

    # Extract nodes-base first
    nodes = {}
    if os.path.isdir(base):
        nodes.update(scan_nodes(base, prefix="n8n-nodes-base"))

    # Extract langchain nodes — don't overwrite nodes-base entries
    if langchain and os.path.isdir(langchain):
        lc = scan_nodes(langchain, prefix="@n8n/n8n-nodes-langchain", cat_override="ai")
        for k, v in lc.items():
            if k not in nodes:  # Don't let langchain Code overwrite base Code
                nodes[k] = v
            else:
                # Store langchain version with prefixed key
                nodes[f"lc_{k}"] = v

    # Sort by name
    nodes = dict(sorted(nodes.items()))

    output = {
        "_description": "Auto-extracted from n8n source repo. Run `python sandbox/extractor.py` to regenerate.",
        "_source": REPO,
        "_count": len(nodes),
        "nodes": nodes
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=str)

    print(f"Extracted {len(nodes)} nodes -> {OUT}")

    cats = {}
    for n in nodes.values():
        c = n.get("category", "unknown")
        cats[c] = cats.get(c, 0) + 1
    for c, count in sorted(cats.items()):
        print(f"  {c}: {count}")

if __name__ == "__main__":
    main()
