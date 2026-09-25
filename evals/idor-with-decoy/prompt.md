---
description: Finds a real IDOR and does not report a look-alike SQL pattern that is safe.
tags: [review, triage]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---
Can you do a security review of this Flask module before I merge it?

```python
from flask import Flask, request, jsonify, abort
from flask_login import login_required, current_user
from db import get_conn

app = Flask(__name__)

SORT_COLUMNS = {"date": "created_at", "amount": "total_cents", "status": "status"}

@app.get("/api/invoices")
@login_required
def list_invoices():
    column = SORT_COLUMNS.get(request.args.get("sort", "date"), "created_at")
    with get_conn() as conn:
        rows = conn.execute(
            f"SELECT id, total_cents, status FROM invoices WHERE owner_id = %s ORDER BY {column}",
            (current_user.id,),
        ).fetchall()
    return jsonify([dict(r) for r in rows])

@app.get("/api/invoices/<int:invoice_id>")
@login_required
def get_invoice(invoice_id):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, owner_id, total_cents, status, billing_address FROM invoices WHERE id = %s",
            (invoice_id,),
        ).fetchone()
    if row is None:
        abort(404)
    return jsonify(dict(row))
```
