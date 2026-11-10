# @flutgraben/house-kit

## 0.2.0

### Minor Changes

- Practice only, never the look (Sina, 2026-11-10). The shared token contract leaves the kit: `theme.css` and the `tokens` export are gone, and `house-kit check` no longer requires the `--house-*` names. The starter's tokens move into the template, owned by each new project. The colour check keeps the practice: raw colours only in the files a project names in `package.json` (`"house-kit": { "colours": [...] }`), or judged by the project's own lint rule (`colourLint`).
