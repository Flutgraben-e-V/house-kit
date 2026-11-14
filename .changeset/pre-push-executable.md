---
"@flutgraben/house-kit": patch
---

The pre-push hook runs again (2026-11-14). The published package lost the hook's executable bit (pnpm pack writes every file that is not a bin as 0644), so `init` wrote `.githooks/pre-push` as 0644 and git skipped it without a word: `pnpm gates` never ran on push. `init` now makes the hook executable itself, and `house-kit check` fails on `hook` when `.githooks/pre-push` is missing or not executable, with the fix to run.
