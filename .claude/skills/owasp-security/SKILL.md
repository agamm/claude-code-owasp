---
name: owasp-security
description: Reviews code for security vulnerabilities and guides secure implementation using OWASP Top 10:2025, ASVS 5.0, the OWASP Top 10 for LLM Applications (2026), and the OWASP Top 10 for Agentic Applications (2026). Use when reviewing code or a diff for security issues, implementing authentication, authorization, sessions, or cryptography, handling untrusted input, files, or URLs, hardening config, dependencies, or CI, or building LLM and AI agent features.
when_to_use: Trigger phrases include "security review", "security check", "anything exploitable", "audit this", "is this secure", "is this safe to ship", "check for vulnerabilities", "find security bugs", "threat model", "OWASP", "ASVS", "CWE", "prompt injection", "MCP server security", "secrets in code", "supply chain", and "harden this Dockerfile or workflow".
---

# OWASP Security

Apply these standards when writing or reviewing code. For a review, follow the workflow below.

**Reference files** (read the one the task needs, and only the section you need):
- [`reference/review-checklist.md`](reference/review-checklist.md): coverage checklist for every Top 10 category, plus LLM and agent checks. Read during step 3 of a review.
- [`reference/languages.md`](reference/languages.md): per-language pitfalls with unsafe/safe examples for 20+ languages. Read the section for the language under review.
- [`reference/config-and-supply-chain.md`](reference/config-and-supply-chain.md): A02 and A03 in Dockerfiles, Kubernetes, Terraform, framework config, security headers, lockfiles, and CI/CD. Read when the change touches config, IaC, dependencies, or pipelines.
- [`reference/owasp-report.md`](reference/owasp-report.md): attack vectors, mitigations, and worked examples for every Top 10:2025, ASVS 5.0, LLM Top 10, and Agentic item. About 1100 lines: jump to the section you need.

## Security Review Workflow

Copy this checklist into your response and tick it off as you go:

```
Security Review Progress:
- [ ] Step 1: Map entry points and trust boundaries
- [ ] Step 2: Load the references this code needs
- [ ] Step 3: Sweep for candidate issues
- [ ] Step 4: Triage every candidate
- [ ] Step 5: Report findings
```

**Step 1: Map entry points and trust boundaries.** List where attacker-controlled data enters:
routes and handlers, headers and cookies, uploads, webhooks, queue consumers, CLI arguments,
third-party API responses, and anything an LLM reads or returns. Note where authentication and
authorization are enforced; it is often centralized in middleware rather than per route.

**Step 2: Load the references this code needs.** The language section of `languages.md`;
`config-and-supply-chain.md` if config, IaC, dependencies, or CI changed; the LLM and Agentic
sections of `owasp-report.md` if the code calls a model or runs an agent.

**Step 3: Sweep for candidate issues.** Walk `review-checklist.md` for the categories the code
touches. For each candidate, trace the path from an entry point in step 1 to the sink.

**Step 4: Triage every candidate** with the rubric in "Before Reporting a Finding" below. Drop
candidates that fail it, or downgrade them to defense-in-depth. If a candidate's reachability
is unclear, go back to step 1 for that input before deciding.

**Step 5: Report findings** in the format below, highest severity first.

## Before Reporting a Finding

A pattern match is not a vulnerability. The most common failure mode in automated security
review is reporting unreachable or already-mitigated code, which buries the real findings.
Confirm all four before reporting:

1. **Is the input actually attacker-controlled?** Trace it back to a real entry point: a
   request parameter, header, cookie, uploaded file, webhook, queue message, or third-party
   API response. A value that only ever comes from a constant, an enum, or trusted internal
   config is not an injection source.
2. **Is the sink reachable with that input?** Check whether validation, an allowlist, an ORM,
   or a framework-level control already sits between them. Look for auth middleware
   (`middleware.ts`, `proxy.ts`, Express/Django/Rails middleware, a base controller,
   decorators) before flagging a route as missing authorization. Enforcement is often
   centralized rather than per-route.
3. **What is the blast radius?** Who can trigger it, what do they get, and does it cross a
   trust boundary? An SSRF reaching cloud metadata differs from one reaching localhost only.
4. **Can the attacker perform every step?** Each step of the exploit must be possible from
   the attacker's position. A symlink race needs a way to create symlinks on the server; a
   header attack needs a client that can set that header. If a step needs a capability the
   code doesn't show the attacker having, the finding is "Needs verification", not High.

Report severity by exploitability, not by pattern. State the concrete path (*this input
reaches this sink*) and say so explicitly when a finding is theoretical or defense-in-depth
rather than directly exploitable. If reachability can't be determined from the code available,
say that instead of asserting either way.

## Reporting Format

One block per finding, highest severity first:

```
[SEVERITY] Title (CWE-###, OWASP A##:2025, LLM## Risk Name, ASI## Risk Name)
Location:   path/to/file.ext:LINE
Path:       <entry point> -> <intermediate hops> -> <sink>
Impact:     who can trigger it, what they get, which trust boundary it crosses
Fix:        the concrete change, with a code snippet when it isn't obvious
Confidence: Confirmed | Likely | Needs verification (say what you couldn't see)
```

Write every LLM and ASI ID with its risk name, e.g. "LLM03 Excessive Agency". A bare LLM ID is
ambiguous: the 2025 and 2026 editions use the same numbers for different risks.

| Severity | Meaning |
|---|---|
| Critical | Unauthenticated remote code execution, auth bypass, or mass data exposure |
| High | Authenticated exploitation crossing a trust boundary (IDOR into other tenants, SQLi behind login) |
| Medium | Needs unusual preconditions, or impact is limited to the attacker's own data |
| Low | Defense-in-depth gap with no demonstrated exploit path |
| Info | Hardening suggestion; say plainly that it is not a vulnerability |

If the review finds nothing exploitable, say so directly. Do not pad the report with Info items
to look thorough; a long list is what makes real findings get ignored.

## OWASP Top 10:2025

Three categories were renamed from 2021 and two are new (A03, A10). Use these names and
numbers; much OWASP material online still cites the 2021 list.

| # | Category | Key Prevention |
|---|----------|----------------|
| A01 | Broken Access Control (now includes SSRF) | Deny by default, enforce server-side, verify ownership |
| A02 | Security Misconfiguration | Harden configs, disable defaults, minimize features |
| A03 | Software Supply Chain Failures | Lock versions, verify integrity, audit dependencies |
| A04 | Cryptographic Failures | TLS 1.2+, AES-256-GCM, Argon2/bcrypt for passwords |
| A05 | Injection | Parameterized queries, input validation, safe APIs |
| A06 | Insecure Design | Threat model, rate limit, design security controls |
| A07 | Authentication Failures | MFA, check breached passwords, secure sessions |
| A08 | Software or Data Integrity Failures | Sign packages, SRI for CDN, safe serialization |
| A09 | Security Logging and Alerting Failures | Log security events, structured format, alerting |
| A10 | Mishandling of Exceptional Conditions | Fail-closed, hide internals, log with context |

## OWASP Top 10 for LLM Applications (2026)

For applications that call LLMs (chatbots, RAG, copilots, agents). The 2026 edition renumbered
the list; translate 2025 IDs with the table in `owasp-report.md` and cite 2026 IDs only.

| # | Risk | Key Mitigation |
|---|------|----------------|
| LLM01 | Prompt Injection | No complete fix exists. Fence untrusted content (including images, audio, tool output), keep privileges out of the model's reach, filter outputs |
| LLM02 | Sensitive Information Disclosure | Sanitize training/RAG data, strip PII from context, restrict what the model can retrieve per user |
| LLM03 | Excessive Agency | Minimize tools and permissions, require human approval for destructive actions, scope credentials per task |
| LLM04 | Supply Chain | Verify model provenance and signatures, vet third-party model hubs, lock model + adapter versions |
| LLM05 | Data and Model Poisoning | Validate training/fine-tuning sources, anomaly-detect on data ingestion, hold-out integrity tests |
| LLM06 | Unbounded Consumption | Rate-limit per user/key, cap tokens and tool calls per request, monitor cost, set hard timeouts |
| LLM07 | Misinformation | Cite sources, surface confidence, require grounding for high-stakes answers, disclose AI provenance |
| LLM08 | Hidden Context Exposure | Assume the system prompt, tool schemas, and other hidden context are extractable: no secrets there, and no authorization or policy that relies on them staying hidden |
| LLM09 | Vector and Embedding Weaknesses | Tenant-isolate vector stores, access-control on retrieval, sign or hash chunks against indirect prompt injection |
| LLM10 | Improper Output Handling | Treat all LLM output, including generated code, as untrusted input: validate, escape, or sandbox before any sink (SQL, shell, HTML, code, tool calls) |

## OWASP Top 10 for Agentic Applications (2026)

For AI agent systems that plan, call tools, or keep memory:

| Risk | Description | Mitigation |
|------|-------------|------------|
| ASI01: Agent Goal Hijack | Prompt injection alters agent objectives | Treat tool and retrieved content as data, goal boundaries, behavioral monitoring |
| ASI02: Tool Misuse & Exploitation | Tools used in unintended ways | Least privilege, fine-grained permissions, validate I/O |
| ASI03: Identity & Privilege Abuse | Delegated trust, inherited credentials, role chain exploits | Short-lived scoped tokens, identity verification |
| ASI04: Agentic Supply Chain Vulnerabilities | Compromised plugins/MCP servers | Verify signatures, sandbox, allowlist plugins |
| ASI05: Unexpected Code Execution | Unsafe code generation/execution | Sandbox execution, static analysis, human approval |
| ASI06: Memory & Context Poisoning | Corrupted RAG/context data | Validate stored content, segment by trust level |
| ASI07: Insecure Inter-Agent Communication | Spoofing/intercepting agent-to-agent messages | Authenticate, encrypt, verify message integrity |
| ASI08: Cascading Failures | Errors propagate across systems | Circuit breakers, graceful degradation, isolation |
| ASI09: Human-Agent Trust Exploitation | Over-trust in agents leveraged to manipulate users | Label AI content, user education, verification steps |
| ASI10: Rogue Agents | Compromised agents acting maliciously | Behavior monitoring, kill switches, anomaly detection |

## ASVS 5.0 Key Requirements

ASVS 5.0 (May 2025) renumbered and reorganized every chapter. **4.0 requirement IDs do not
map to 5.0** — `V2.1.1` meant "password length" in 4.0 and means something else now. Cite
5.0 IDs only. Levels are defined by share of requirements, not by application category:

| Level | Share | Intent |
|---|---|---|
| L1 | ~20% | Minimum bar; deliberately small to lower the barrier to entry |
| L2 | ~50% (≈70% cumulative) | What most applications should target |
| L3 | remaining ~30% | Highest assurance |

### Level 1 — the minimum bar
- Passwords **at least 8 characters**; 15+ strongly recommended (6.2.1)
- No composition rules — permit any characters, paste, and password managers (6.2.5, 6.2.7)
- Block at least the top 3000 common passwords (6.2.4)
- Anti-automation against credential stuffing and brute force (6.3.1)
- No default accounts like `root`/`admin`/`sa` (6.3.2)
- Reference session tokens from a CSPRNG with 128+ bits entropy (7.2.3)
- New session token issued on authentication and re-authentication (7.2.4)
- Session fully unusable after logout or expiry (7.4.1)
- Function-level and data-level access restricted to explicit permissions (8.2.1, 8.2.2)
- Authorization enforced at a trusted service layer the client cannot manipulate (8.3.1)
- Parameterized queries / ORM for all data access (1.2.4); parameterized OS calls (1.2.5)
- Context-appropriate output encoding for HTML, URLs, and JavaScript/JSON (1.2.1–1.2.3)
- Avoid `eval()` and dynamic code execution (1.3.2)
- Input validated at a trusted service layer, positive/allowlist where possible (2.2.1, 2.2.2)
- TLS 1.2+ on all external traffic, publicly trusted certificates (12.1.1, 12.2.1, 12.2.2)
- Approved ciphers and modes only — no ECB, no PKCS#1 v1.5 padding (11.3.1, 11.3.2)
- No sensitive data in URLs or query strings (14.2.1)

### Level 2 — what most applications should target
- MFA, or a documented combination of single factors (6.3.3)
- Passwords checked against a breached-password set (6.2.12)
- No forced periodic password rotation — rotate only on compromise (6.2.10)
- **All security logging starts here.** ASVS 5.0 has *no* L1 logging requirements; the whole
  of V16 is L2+. Log authentication attempts, failed authorization, security events, and
  unexpected errors (16.3.1–16.3.4)
- Log entries carry when/where/who/what metadata on a synchronized clock (16.2.1, 16.2.2)
- Logs encoded against log injection, protected from modification, shipped off-box (16.4.1–16.4.3)
- Generic error message to the user; detail stays in the log (16.5.1)

### Level 3 — highest assurance

ASVS 5.0 has **92 L3 requirements**; they are not enumerated here. Two worth knowing because
they tighten an L2 requirement rather than adding a new one:

- One factor must be hardware-based and phishing-resistant, e.g. a FIDO key (6.3.3, L3 clause)
- Log **all** authorization decisions, not only failures (16.3.2, L3 clause)

For an actual L3 assessment, work from the standard itself — see
[`reference/owasp-report.md`](reference/owasp-report.md) for the chapter map.
