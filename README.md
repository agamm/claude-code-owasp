# OWASP Security Skill for Claude Code

A Claude Code skill providing the latest OWASP security best practices (2025-2026) for developers building secure applications.

## Quick Install

Install as a Claude Code plugin:

```
/plugin marketplace add agamm/claude-code-owasp
/plugin install owasp-security@agamm
```

### Updating

Third-party marketplaces don't auto-update by default. Either update by hand:

```bash
claude plugin marketplace update agamm
claude plugin update owasp-security@agamm
```

or turn on auto-update once: run `/plugin`, open the **Marketplaces** tab, select `agamm`, and
choose **Enable auto-update**. Updates apply to the next session, or run `/reload-plugins`.

### Install as a plain skill

The skill is a directory (`SKILL.md` plus on-demand `reference/` files), so install the whole
folder. The easiest way is [`degit`](https://github.com/Rich-Harris/degit), which copies a
GitHub subdirectory without the `.git` history:

```bash
npx degit agamm/claude-code-owasp/.claude/skills/owasp-security .claude/skills/owasp-security
```

Or install globally for all projects:

```bash
npx degit agamm/claude-code-owasp/.claude/skills/owasp-security ~/.claude/skills/owasp-security
```

## What's Included

### Claude Code Skill
Location: `.claude/skills/owasp-security/`

`SKILL.md` (loaded when the skill triggers):
- **Security review workflow** - a five-step checklist from entry points to report
- **Finding-triage rubric** - confirm attacker-controlled input, sink reachability, and blast radius before reporting, to cut false positives
- **Reporting format** - fixed finding structure (location, input-to-sink path, impact, fix, confidence) with severity rated by exploitability
- **OWASP Top 10:2025** quick reference table
- **OWASP Top 10 for LLM Applications (2026)** - LLM01-LLM10 risks for chatbots, RAG, and tool-calling apps
- **OWASP Agentic AI Security (2026)** - ASI01-ASI10 risks for AI agent systems
- **ASVS 5.0** key requirements with real 5.0 requirement IDs and levels

`reference/` (loaded on demand, following Claude Code progressive-disclosure best practices):
- **`review-checklist.md`** - coverage checklist for every Top 10 category (including SSRF, file handling, JWTs, CORS, and CSRF) plus LLM and agent features
- **`languages.md`** - language-specific security quirks for 20+ languages with unsafe/safe examples
- **`config-and-supply-chain.md`** - A02 and A03 where they actually live: Dockerfiles, Kubernetes, Terraform, framework config, security headers, lockfiles, dependency confusion, install scripts, and CI/CD workflows
- **`owasp-report.md`** - deep-dive on the Top 10:2025, ASVS 5.0, the LLM Top 10 (2026), and the Agentic list (2026), with per-item attack vectors and mitigations

### Accuracy

Category names, ASVS chapter structure, and ASVS requirement IDs and levels are verified
directly against [owasp.org/Top10/2025](https://owasp.org/Top10/2025/),
[github.com/OWASP/ASVS](https://github.com/OWASP/ASVS/tree/master/5.0/en), and
the [LLM Top 10 2026 PDF](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) rather than paraphrased.
The Agentic Top 10 names are checked against that PDF's framework-mapping appendix.

This matters more than it sounds: ASVS 5.0 renumbered every chapter, so 4.0 requirement IDs
do not carry over, three Top 10 categories were renamed in 2025, and the LLM Top 10 2026
reordered eight of its ten entries. Much of the OWASP
material circulating online still cites the old IDs and names.

## Usage

Once installed, Claude Code automatically activates this skill when you:
- Review code for security vulnerabilities
- Implement authentication or authorization
- Handle user input or external data
- Work with cryptography or password storage
- Design API endpoints
- Build AI agent systems

### Example Prompts
```
"Review this code for security issues"
"Is this authentication implementation secure?"
"What are the security risks in this Python code?"
"Help me implement secure session management"
"Check this AI agent for OWASP agentic risks"
```

## Covered Standards

| Standard | Version | Focus |
|----------|---------|-------|
| OWASP Top 10 | 2025 | Web application vulnerabilities |
| OWASP ASVS | 5.0.0 | Security verification requirements |
| OWASP Top 10 for LLM Apps | 2026 | LLM/RAG/tool-calling app risks |
| OWASP Agentic | 2026 | AI agent security risks |

## Language Coverage

Security quirks for 20+ languages including:

| Web | Systems | Mobile | Scripting |
|-----|---------|--------|-----------|
| JavaScript/TypeScript | C/C++ | Swift | Python |
| PHP | Rust | Kotlin | Ruby |
| Java | Go | Dart | Perl |
| C# | | | Shell |

Each language section includes common vulnerabilities, unsafe/safe code patterns, and key functions to watch for.

## Evals

`evals/` holds test cases for [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals):
a real finding next to a safe look-alike, safe code that should not draw High findings, a real but
conditional risk that should be rated below High, an LLM agent that runs model output in a shell, and
an unrelated request that should not load the skill. Each case runs with and without the skill, so the
score shows what the skill adds. Evals target Sonnet and Opus; each case pins `model: sonnet`.

```bash
claude plugin eval .               # Sonnet, the pinned default
claude plugin eval . --model opus
```

Runs are real model calls billed to your account. Run the suite before and after any change to
`SKILL.md` or its description.

## Alternative Installation

### Clone Full Repository
```bash
git clone https://github.com/agamm/claude-code-owasp.git
cp -r claude-code-owasp/.claude/skills/owasp-security YOUR_PROJECT/.claude/skills/
```

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Run the evals, and add a case if you are fixing a behavior they missed
4. Submit a pull request

The skill follows Anthropic's [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices):
keep `SKILL.md` to what Claude would otherwise get wrong, and put depth in `reference/`.

## Sources

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP ASVS 5.0](https://github.com/OWASP/ASVS/tree/master/5.0/en) — chapter files, one per V-number
- [OWASP Top 10 for LLM Applications 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)
- [OWASP GenAI Security Project](https://genai.owasp.org/) — home of the LLM and Agentic lists
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## License

MIT License - See LICENSE file for details.

---

**Keywords:** OWASP, security, Claude Code, AI security, application security, ASVS, secure coding, vulnerability, injection, XSS, CSRF, authentication, authorization
