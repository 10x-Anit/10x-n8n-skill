#!/usr/bin/env python3
"""10x.in n8n Skill — Sandbox init.
Downloads source files from 10x-n8n-skill GitHub repo on first run.
NPM package ships skills/agents/commands/sandbox. Source files come from GitHub.
"""
import os, sys, platform, json, subprocess, datetime as dt

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(R, "sandbox")
L = os.path.join(R, "logs")
V = os.path.join(R, "sandbox", ".venv")
REPO_DIR = os.path.join(R, "docs", "nodes", "n8n-repo")
IDX = os.path.join(R, "docs", "nodes", "node-index.json")

# Source repo — users get source files from here
# Public = free. Private = paid gateway (owner controls access).
GITHUB_REPO = "https://github.com/10x-Anit/10x-n8n-skill.git"
SPARSE_PATHS = ["docs/nodes/n8n-repo"]

def ensure_dirs():
    """Create the full directory structure the skill expects."""
    for d in [L, os.path.join(R, "projects"), os.path.join(R, ".n8n-track", "handoffs"),
              os.path.join(R, ".n8n-track", "refs", "workflows"),
              os.path.join(R, ".n8n-track", "index"),
              os.path.join(R, "docs", "nodes")]:
        os.makedirs(d, exist_ok=True)

def download_source():
    """Download n8n source files from 10x-n8n-skill GitHub repo via sparse checkout."""
    if os.path.isdir(os.path.join(REPO_DIR, "packages")):
        print("source: already present")
        return True

    print(f"source: downloading from GitHub...")
    tmp = REPO_DIR + "_tmp"

    try:
        # Clean any failed previous attempt
        if os.path.exists(tmp):
            subprocess.run(["rm", "-rf", tmp], capture_output=True)

        # Sparse clone — only get docs/nodes/n8n-repo
        subprocess.run(["git", "clone", "--depth", "1", "--filter=blob:none", "--sparse",
                        "--no-checkout", GITHUB_REPO, tmp],
                       check=True, capture_output=True, text=True, timeout=120)

        subprocess.run(["git", "sparse-checkout", "set"] + SPARSE_PATHS,
                       check=True, capture_output=True, text=True, cwd=tmp, timeout=30)

        subprocess.run(["git", "checkout"],
                       check=True, capture_output=True, text=True, cwd=tmp, timeout=120)

        # Move the nested folder to its final location
        src = os.path.join(tmp, "docs", "nodes", "n8n-repo")
        if os.path.isdir(src):
            # Remove target if exists (partial)
            if os.path.exists(REPO_DIR):
                subprocess.run(["rm", "-rf", REPO_DIR], capture_output=True)
            subprocess.run(["mv", src, REPO_DIR] if platform.system() != "Windows"
                          else ["cmd", "/c", "move", src, REPO_DIR],
                          capture_output=True, text=True)
            # On Windows, use shutil as fallback
            if not os.path.isdir(REPO_DIR):
                import shutil
                shutil.move(src, REPO_DIR)

        # Cleanup temp
        subprocess.run(["rm", "-rf", tmp], capture_output=True)
        if os.path.exists(tmp):
            import shutil
            shutil.rmtree(tmp, ignore_errors=True)

        if os.path.isdir(os.path.join(REPO_DIR, "packages")):
            print("source: downloaded successfully")
            return True
        else:
            print("source: download incomplete")
            return False

    except Exception as e:
        print(f"source: download failed ({e})")
        # Cleanup
        if os.path.exists(tmp):
            try:
                import shutil
                shutil.rmtree(tmp, ignore_errors=True)
            except Exception:
                pass
        return False

def build_index():
    """Extract node index from source if missing or outdated."""
    if os.path.exists(IDX):
        try:
            idx = json.load(open(IDX, "r", encoding="utf-8"))
            if idx.get("_count", 0) > 400:
                print(f"index: {idx['_count']} nodes (up to date)")
                return True
        except Exception:
            pass

    if not os.path.isdir(os.path.join(REPO_DIR, "packages")):
        print("index: cannot build (no source files)")
        return False

    print("index: extracting from source...")
    try:
        subprocess.run([sys.executable, os.path.join(S, "extractor.py")],
                       check=True, timeout=60)
        return True
    except Exception as e:
        print(f"index: extraction failed ({e})")
        return False

def run():
    ensure_dirs()

    env = {"os": platform.system(), "ver": platform.version(), "arch": platform.machine(),
           "py": sys.version.split()[0], "py_path": sys.executable, "root": R,
           "ts": dt.datetime.now().isoformat(), "source_repo": GITHUB_REPO}
    json.dump(env, open(os.path.join(L, "setup.json"), "w"), indent=2)

    # Bootstrap logs
    if not os.path.exists(os.path.join(L, "activity.jsonl")):
        with open(os.path.join(L, "activity.jsonl"), "w") as f:
            f.write(json.dumps({"a": "init", "s": "ok", "t": env["ts"]}) + "\n")
    if not os.path.exists(os.path.join(L, "actions.json")):
        json.dump({"_v": 1}, open(os.path.join(L, "actions.json"), "w"), indent=2)

    # venv
    venv_ok = os.path.exists(V)
    if not venv_ok:
        try:
            subprocess.run([sys.executable, "-m", "venv", V], check=True)
            venv_ok = True
            print("venv: created")
        except Exception:
            print("venv: skip (not required)")

    # Source files from GitHub
    src_ok = download_source()

    # Node index
    idx_ok = build_index()

    status = "READY" if (src_ok and idx_ok) else "PARTIAL"
    print(f"\n  10x.in | {status}")
    print(f"  {env['os']} {env['arch']} | py {env['py']}")
    print(f"  source {'yes' if src_ok else 'NO'} | index {'yes' if idx_ok else 'NO'}\n")

    if not src_ok:
        print(f"\nTo manually download source files:")
        print(f"  git clone --depth 1 {GITHUB_REPO} /tmp/10x-n8n-skill")
        print(f"  cp -r /tmp/10x-n8n-skill/docs/nodes/n8n-repo {REPO_DIR}")

    return env

if __name__ == "__main__":
    run()
