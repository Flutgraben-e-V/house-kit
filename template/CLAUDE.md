# __NAME__

A house project: built on `@flutgraben/house-kit` and written by the rules of the
`house-code` plugin. Load the `house-code` skill before changing code here.

- **The kit owns** the stack versions, the Next.js, TypeScript, lint and PostCSS
  settings and the checks. Each of those files here is one line that points at the
  kit. Change them in the kit, never here.
- **This project owns** its pages (`src/app/`), its texts (`src/messages/`) and its
  whole look: the names and values in `src/app/globals.css` and `src/lib/tokens.ts`.
  Raw colours live in `globals.css` only (`house-kit check` holds that).
- **Before you push:** `pnpm gates` (typecheck, lint, `house-kit check`). The
  pre-push hook runs it too. Read its verdict line.
- **Updating the kit:** `pnpm update @flutgraben/house-kit`, then `pnpm gates`.
  `house-kit check` says when a newer kit exists and when a pin has drifted.
- **Hostinger:** build command `pnpm build:hostinger`, start command
  `pnpm start:hostinger`. A push to `main` is a production deploy: work on a branch
  and open a pull request.
