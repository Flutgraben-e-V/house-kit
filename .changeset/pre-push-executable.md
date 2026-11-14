---
"@flutgraben/house-kit": patch
---

The pre-push hook runs again (2026-11-14). The published package lost the hook's executable bit (pnpm pack writes every file that is not a bin as 0644), so `init` wrote `.githooks/pre-push` as 0644 and git skipped it without a word: `pnpm gates` never ran on push. `init` now makes the hook executable itself, and `house-kit check` fails on `hook` in each case where git would skip the hook silently: the hook is missing, it is not executable, git looks for hooks somewhere other than `.githooks` (`core.hooksPath` unset), or git records it without the executable bit, so other clones get it broken. Each failure names its fix. Outside a git repository the wiring is not checked.
