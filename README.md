# OWASP Security Skill for Claude Code

A Claude Code skill providing the latest OWASP security best practices (2025-2026) for developers building secure applications.

## Quick Install (One Line)

Add this skill to any project with a single command:

```bash
curl -sL https://raw.githubusercontent.com/agam/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md -o .claude/skills/owasp-security/SKILL.md --create-dirs
```

Or install globally for all projects:

```bash
curl -sL https://raw.githubusercontent.com/agam/claude-code-owasp/main/.claude/skills/owasp-security/SKILL.md -o ~/.claude/skills/owasp-security/SKILL.md --create-dirs
```

## What's Included

### Claude Code Skill
Location: `.claude/skills/owasp-security/SKILL.md`

- **OWASP Top 10:2025** quick reference table
- **Security code review checklists** for input handling, auth, access control, data protection, and error handling
- **Secure code patterns** with unsafe/safe examples
- **OWASP Agentic AI Security (2026)** - ASI01-ASI10 risks for AI agent systems
- **ASVS 5.0** key requirements by verification level
- **Language-specific security quirks** for 20+ languages with deep analysis guidance

### Research Report
Location: `OWASP-2025-2026-Report.md`

Comprehensive documentation covering all OWASP 2025-2026 standards.

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

- [OWASP Top 10:2025](https://owasp.org/Top10/)
- [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## License

MIT License - See LICENSE file for details.

---

**Keywords:** OWASP, security, Claude Code, AI security, application security, ASVS, secure coding, vulnerability, injection, XSS, CSRF, authentication, authorization
