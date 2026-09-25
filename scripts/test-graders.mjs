// Checks the regex graders against known-good and known-bad text, without a billed eval run.
// Run: node scripts/test-graders.mjs
import { readFileSync } from "node:fs";

function loadGrader(path) {
  const text = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const field = (name) => {
    const m = text.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
    if (!m) return undefined;
    const v = m[1].trim();
    return v.startsWith("'") ? v.slice(1, -1).replaceAll("''", "'") : v;
  };
  const re = new RegExp(field("pattern"), field("flags") ?? "");
  const notContains = field("match") === "not_contains";
  return (s) => (notContains ? !re.test(s) : re.test(s));
}

const cases = {
  "evals/llm-agent-output-handling/graders/names-2026-core-risk.md": {
    pass: [
      "LLM03 Excessive Agency",
      "LLM10 Improper Output Handling",
      "LLM10:2026 Improper Output Handling",
      "Excessive Agency (LLM03)",
      "(CWE-78; LLM01 Prompt Injection + LLM10 Improper Output Handling; ASI02)",
    ],
    fail: [
      "LLM06 Excessive Agency",
      "LLM05 Improper Output Handling",
      "LLM01 Prompt Injection",
      "(CWE-78, LLM01, LLM10, ASI02)",
      "LLM05 Improper Output Handling, LLM10 Unbounded Consumption",
    ],
  },
  "evals/llm-agent-output-handling/graders/no-2025-pairings.md": {
    pass: [
      "LLM07 Misinformation",
      "LLM07:2026 Misinformation",
      "LLM06 Unbounded Consumption",
      "LLM03 Excessive Agency",
      "LLM10 Improper Output Handling",
      "LLM08 Hidden Context Exposure",
      "LLM05 Data and Model Poisoning",
      "(CWE-78, LLM01, LLM05, ASI02)",
      "(LLM03 Excessive Agency, LLM06 Unbounded Consumption, ASI05)",
    ],
    fail: [
      "LLM06 Excessive Agency",
      "LLM10 Unbounded Consumption",
      "LLM05 Improper Output Handling",
      "LLM07 System Prompt Leakage",
      "LLM03 Supply Chain",
      "LLM09 Misinformation",
      "Excessive Agency (LLM06)",
      "LLM06:2025 Excessive Agency",
    ],
  },
};

let failures = 0;
for (const [path, { pass, fail }] of Object.entries(cases)) {
  const grade = loadGrader(path);
  for (const s of pass) if (!grade(s)) { failures++; console.log(`FAIL ${path}: expected pass for ${JSON.stringify(s)}`); }
  for (const s of fail) if (grade(s)) { failures++; console.log(`FAIL ${path}: expected fail for ${JSON.stringify(s)}`); }
}
console.log(failures ? `${failures} grader fixture(s) failed` : "all grader fixtures passed");
process.exit(failures ? 1 : 0);
