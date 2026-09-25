---
description: A real but conditional risk (gzip -f follows symlinks; exploiting it needs a way to plant a symlink). The review should mention it and rate it below High.
tags: [review, triage, severity]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---
Quick security check on this before I ship it. Anything exploitable?

```python
import subprocess
from pathlib import Path
from flask import Flask, request, send_file, abort, g
from auth import load_session_user

app = Flask(__name__)
UPLOAD_ROOT = Path("/srv/uploads").resolve()
ALLOWED_LEVELS = {"1", "6", "9"}

@app.before_request
def require_login():
    g.user = load_session_user(request.cookies.get("session"))
    if g.user is None:
        abort(401)

@app.post("/compress/<name>")
def compress(name):
    level = request.args.get("level", "6")
    if level not in ALLOWED_LEVELS:
        abort(400)
    src = (UPLOAD_ROOT / str(g.user.id) / name).resolve()
    if not src.is_relative_to(UPLOAD_ROOT / str(g.user.id)) or not src.is_file():
        abort(404)
    subprocess.run(["gzip", "-kf", f"-{level}", "--", str(src)], check=True, timeout=30)
    return send_file(str(src) + ".gz")
```
