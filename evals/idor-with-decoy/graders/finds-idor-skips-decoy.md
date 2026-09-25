---
type: llm
---
PASS if the response reports that GET /api/invoices/<invoice_id> returns any user's invoice because it never checks that owner_id matches the current user (IDOR / broken object-level authorization), and does NOT report the ORDER BY in list_invoices as an exploitable SQL injection. Mentioning the ORDER BY f-string as safe, or as defense-in-depth only, is fine.
FAIL if the IDOR is missed, or if the ORDER BY f-string is reported as an exploitable SQL injection.
