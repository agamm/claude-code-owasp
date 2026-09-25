# claude-code-owasp

## Opening a pull request

Run the eval suite before opening any PR, and put the results in the PR description.

```bash
for m in haiku sonnet opus; do
  claude plugin eval . --model $m -j 4 --no-publish --json /tmp/eval-$m.json
done
```

- Each run makes real model calls billed to the account, about $2 per model.
- In the description, add a table with one row per case and a "with / without" score per model,
  taken from each case's `aggregates` (`score`, `scoreWithout`) in the JSON.
- Say which commit the numbers came from. If a later commit changes `SKILL.md` or its
  frontmatter, run the suite again.
- Name any case that scores lower with the skill than without it, and why. Don't hide a regression.
- `evals/results/` is gitignored. Don't commit it.
- After editing any regex grader, run `node scripts/test-graders.mjs` (free, no model calls) and
  add a pass and a fail example for the new behavior.
