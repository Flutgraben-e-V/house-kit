# @flutgraben/house-kit

## 0.2.1

### Patch Changes

- be44870: The pre-push hook runs again (2026-11-14). The published package lost the hook's executable bit (pnpm pack writes every file that is not a bin as 0644), so `init` wrote `.githooks/pre-push` as 0644 and git skipped it without a word: `pnpm gates` never ran on push. `init` now makes the hook executable itself, and `house-kit check` fails on `hook` in each case where git would skip the hook silently: the hook is missing, it is not executable, git looks for hooks somewhere other than `.githooks` (`core.hooksPath` unset), or git records it without the executable bit, so other clones get it broken. Each failure names its fix. Outside a git repository the wiring is not checked.

## 0.2.0

### Minor Changes

- Practice only, never the look (Sina, 2026-11-10). The shared token contract leaves the kit: `theme.css` and the `tokens` export are gone, and `house-kit check` no longer requires the `--house-*` names. The starter's tokens move into the template, owned by each new project. The colour check keeps the practice: raw colours only in the files a project names in `package.json` (`"house-kit": { "colours": [...] }`), or judged by the project's own lint rule (`colourLint`).
