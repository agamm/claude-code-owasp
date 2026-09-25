---
description: Agent code that executes model output. The review should name the OWASP LLM or Agentic risk IDs.
tags: [review, llm, agentic]
model: sonnet
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---
This is the core loop of our support agent. It reads customer emails and can run diagnostics. Is it secure?

```python
import subprocess
from anthropic import Anthropic

client = Anthropic()
TOOLS = [{
    "name": "run_diagnostic",
    "description": "Run a shell diagnostic command on the support host",
    "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]},
}]

def handle_email(email_body: str) -> str:
    messages = [{"role": "user", "content": f"Customer email:\n{email_body}\n\nHelp this customer."}]
    while True:
        resp = client.messages.create(model="claude-sonnet-5", max_tokens=2048, tools=TOOLS, messages=messages)
        if resp.stop_reason != "tool_use":
            return resp.content[0].text
        messages.append({"role": "assistant", "content": resp.content})
        results = []
        for block in resp.content:
            if block.type == "tool_use":
                out = subprocess.run(block.input["command"], shell=True, capture_output=True, text=True)
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": out.stdout + out.stderr})
        messages.append({"role": "user", "content": results})
```
