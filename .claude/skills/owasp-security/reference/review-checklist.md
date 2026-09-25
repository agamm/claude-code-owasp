# Security Review Checklist

Coverage list for step 3 of the review workflow in `SKILL.md`. Skip sections the change does not
touch. A checked-off gap is a lead to trace, not a finding: run it through the triage rubric in
`SKILL.md` before reporting it.

## Contents
- Input Handling (A05)
- Authentication & Sessions (A07)
- Access Control (A01)
- Server-Side Request Forgery (A01)
- File Handling (A01)
- Insecure Design (A06)
- Configuration & Hardening (A02)
- Dependencies & Supply Chain (A03)
- Serialization & Data Integrity (A08)
- Data Protection (A04)
- Error Handling & Logging (A09/A10)
- LLM and Agent Features (LLM Top 10 2026, Agentic 2026)

## Input Handling (A05)
- [ ] All user input validated server-side
- [ ] Using parameterized queries (not string concatenation)
- [ ] Input length limits enforced
- [ ] Allowlist validation preferred over denylist
- [ ] Output encoded for its context: HTML body, attribute, URL, JS, CSS are different rules
- [ ] No raw HTML sinks fed by user data (`innerHTML`, `dangerouslySetInnerHTML`, `|safe`, `v-html`)
- [ ] OS commands invoked with an argv array, never a shell string
- [ ] XML parsers configured with external entity resolution disabled (XXE, filed under A02 in 2025)
- [ ] Templates never built from user input (SSTI)

## Authentication & Sessions (A07)
- [ ] Passwords hashed with Argon2/bcrypt (not MD5/SHA1)
- [ ] Session tokens have sufficient entropy (128+ bits)
- [ ] New session token issued on login (no session fixation)
- [ ] Sessions invalidated on logout, password change, and account disable
- [ ] Cookies set `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter
- [ ] MFA available for sensitive operations
- [ ] JWTs: algorithm pinned server-side (`alg: none` and algorithm confusion rejected),
      signature verified, `exp`/`aud`/`iss` checked

## Access Control (A01)
- [ ] Authorization checked on every request
- [ ] Using object references user cannot manipulate
- [ ] Deny by default policy
- [ ] Privilege escalation paths reviewed
- [ ] Object-level checks verify ownership/tenancy, not just "is authenticated" (IDOR/BOLA)
- [ ] State-changing requests protected against CSRF (token or `SameSite` + origin check)
- [ ] Redirect targets validated against an allowlist (no open redirect)
- [ ] CORS: no `Access-Control-Allow-Origin: *` combined with credentials, no origin reflection

## Server-Side Request Forgery (A01)
- [ ] User-supplied URLs resolved and validated against an allowlist of hosts/schemes
- [ ] Private, loopback, and link-local ranges blocked, including after DNS resolution
- [ ] Redirects not followed blindly to a new host (re-validate each hop)
- [ ] Cloud metadata endpoints (`169.254.169.254`) unreachable from the app

## File Handling (A01)
- [ ] Upload type validated by content, not just extension or `Content-Type`
- [ ] Uploads stored outside the web root, served with a non-executable content type
- [ ] File size limits and quota enforced
- [ ] Paths built from user input canonicalized and confined to a base directory (no `../`)
- [ ] Archive extraction guards against path traversal and zip bombs

## Insecure Design (A06)
- [ ] Prices, quantities, roles, and state transitions decided server-side, never taken from the client
- [ ] Rate limits on login, password reset, OTP, signup, and expensive operations
- [ ] Multi-step flows can't be skipped, reordered, or replayed (one-time tokens, idempotency keys)
- [ ] Balance, inventory, and coupon updates are atomic (no check-then-write race)

## Configuration & Hardening (A02)
- [ ] Debug mode, verbose errors, and dev tooling disabled in production
- [ ] Default credentials and sample/admin accounts removed
- [ ] Unused features, ports, endpoints, and HTTP methods disabled
- [ ] Security headers set: CSP without `unsafe-inline`/`unsafe-eval`, HSTS,
      `X-Content-Type-Options: nosniff`, `Referrer-Policy`
- [ ] Cloud storage and object buckets are not publicly readable/writable
- [ ] Container/infra config reviewed (non-root user, no privileged mode, no secrets in image layers)

## Dependencies & Supply Chain (A03)
- [ ] Lockfile committed and versions pinned (no floating ranges in production builds)
- [ ] Dependencies scanned for known vulnerabilities and unmaintained packages
- [ ] Package names checked against typosquats and dependency confusion (internal names claimed publicly)
- [ ] Third-party scripts loaded with Subresource Integrity, or self-hosted
- [ ] Build and CI scripts reviewed: install hooks and pipeline steps run with repo write access
- [ ] Artifacts and releases signed; signatures verified before deploy

## Serialization & Data Integrity (A08)
- [ ] No deserialization of untrusted data with a native format (`pickle`, `Marshal`,
      `ObjectInputStream`, `BinaryFormatter`, `yaml.load`)
- [ ] JSON/schema-validated formats used instead, with a type allowlist
- [ ] Auto-update and plugin loading verify signatures before execution

## Data Protection (A04)
- [ ] Sensitive data encrypted at rest
- [ ] TLS for all data in transit
- [ ] No sensitive data in URLs/logs
- [ ] Secrets in environment/vault (not code), and not in git history or container layers
- [ ] Authenticated encryption (AES-GCM/ChaCha20-Poly1305); no ECB, no unauthenticated CBC
- [ ] IVs/nonces unique per encryption; randomness from a CSPRNG, not `Math.random`/`rand()`
- [ ] Secrets and tokens compared in constant time

## Error Handling & Logging (A09/A10)
- [ ] No stack traces exposed to users
- [ ] Fail-closed on errors (deny, not allow)
- [ ] All exceptions logged with context
- [ ] Consistent error responses (no user/account enumeration via message or timing)
- [ ] Auth events, authorization failures, and security-control failures logged
- [ ] Logs exclude credentials, tokens, and PII; user input encoded to prevent log injection
- [ ] Empty `catch` blocks and swallowed errors reviewed: silent failure hides attacks

## LLM and Agent Features (LLM Top 10 2026, Agentic 2026)
- [ ] Untrusted text (user input, web pages, email, RAG chunks, tool output) can't steer a model
      that holds privileged tools (LLM01, ASI01)
- [ ] Model output validated or escaped before any SQL, shell, HTML, code, or tool argument (LLM10)
- [ ] Tools minimal and scoped; no general shell or HTTP tool unless required; destructive
      actions need human approval (LLM03, ASI02)
- [ ] Agent credentials short-lived and scoped to the task, never an admin or the user's full session (ASI03)
- [ ] Retrieval enforces the caller's tenant and permissions at query time (LLM02, LLM09)
- [ ] No secrets or authorization logic in the system prompt, tool schemas, or other hidden context (LLM08)
- [ ] MCP servers, plugins, and models pinned and from trusted sources (LLM04, ASI04)
- [ ] Generated code runs in a sandbox (ASI05)
- [ ] Writes to agent memory or the vector store validated, so untrusted content can't persist
      instructions (ASI06)
- [ ] Per-user caps on requests, tokens, tool calls, and cost, plus hard timeouts (LLM06)
- [ ] Tool calls logged, with a way to stop a running agent (ASI08, ASI10)
