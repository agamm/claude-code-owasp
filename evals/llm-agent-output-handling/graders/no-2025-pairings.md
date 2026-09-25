---
type: regex
flags: i
match: not_contains
pattern: '\bLLM0?(?:3\W{1,8}(?:20\d\d\W{1,4})?Supply Chain|4\W{1,8}(?:20\d\d\W{1,4})?(?:Data and Model\s)?Poisoning|5\W{1,8}(?:20\d\d\W{1,4})?(?:Improper\s)?Output Handling|6\W{1,8}(?:20\d\d\W{1,4})?Excessive Agency|7\W{1,8}(?:20\d\d\W{1,4})?System Prompt|8\W{1,8}(?:20\d\d\W{1,4})?Vector|9\W{1,8}(?:20\d\d\W{1,4})?Misinformation)|\bLLM10\W{1,8}(?:20\d\d\W{1,4})?Unbounded Consumption|(?:Supply Chain\s*[(\[]\s*(?:OWASP\s)?LLM0?3|Poisoning\s*[(\[]\s*(?:OWASP\s)?LLM0?4|Output Handling\s*[(\[]\s*(?:OWASP\s)?LLM0?5|Excessive Agency\s*[(\[]\s*(?:OWASP\s)?LLM0?6|System Prompt Leakage\s*[(\[]\s*(?:OWASP\s)?LLM0?7|Embedding Weaknesses\s*[(\[]\s*(?:OWASP\s)?LLM0?8|Misinformation\s*[(\[]\s*(?:OWASP\s)?LLM0?9|Unbounded Consumption\s*[(\[]\s*(?:OWASP\s)?LLM10)\b'
---
