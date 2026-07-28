# OWASP Security Skill for Claude Code

A Claude Code skill providing the latest OWASP security best practices (2025-2026) for developers building secure applications.

## Quick Install

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

`SKILL.md` (the always-loaded core):
- **OWASP Top 10:2025** quick reference table
- **Finding-triage rubric** - confirm attacker-controlled input, sink reachability, and blast radius before reporting, to cut false positives
- **Security code review checklists** for input handling, auth, access control, data protection, and error handling
- **Secure code patterns** with unsafe/safe examples
- **OWASP Top 10 for LLM Applications (2025)** - LLM01-LLM10 risks for chatbots, RAG, and tool-calling apps
- **OWASP Agentic AI Security (2026)** - ASI01-ASI10 risks for AI agent systems
- **ASVS 5.0** key requirements with real 5.0 requirement IDs and levels
- **Deep security analysis mindset** for any language

`reference/` (loaded on demand, following Claude Code progressive-disclosure best practices):
- **`languages.md`** - language-specific security quirks for 20+ languages with unsafe/safe examples
- **`owasp-report.md`** - deep-dive on the Top 10:2025, ASVS 5.0, the LLM Top 10 (2025), and the Agentic list (2026), with per-item attack vectors and mitigations

### Accuracy

Category names, ASVS chapter structure, and ASVS requirement IDs and levels are verified
directly against [owasp.org/Top10/2025](https://owasp.org/Top10/2025/),
[github.com/OWASP/ASVS](https://github.com/OWASP/ASVS/tree/master/5.0/en), and
[genai.owasp.org](https://genai.owasp.org/llm-top-10/) rather than paraphrased.

This matters more than it sounds: ASVS 5.0 renumbered every chapter, so 4.0 requirement IDs
do not carry over, and three Top 10 categories were renamed in 2025. Much of the OWASP
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
| OWASP Top 10 for LLM Apps | 2025 | LLM/RAG/tool-calling app risks |
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
3. Submit a pull request

## Sources

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP ASVS 5.0](https://github.com/OWASP/ASVS/tree/master/5.0/en) — chapter files, one per V-number
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP GenAI Security Project](https://genai.owasp.org/) — home of the LLM and Agentic lists
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## License

MIT License - See LICENSE file for details.

---

**Keywords:** OWASP, security, Claude Code, AI security, application security, ASVS, secure coding, vulnerability, injection, XSS, CSRF, authentication, authorization
