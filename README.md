# house-kit

The house kit: what every house web project installs, so that a fix made once
reaches every project at its next update. The rules for *how* to write code live
in the `house-code` plugin; this kit carries the code that applies them.

| | |
|---|---|
| `house.json` | the house pins: Node, pnpm and the stack versions every project runs |
| `next.mjs` | `withHouse()`: the Next.js settings learned on Hostinger |
| `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.base.json` | the shared settings, each extended by a one-line file in the project |
| `theme.css`, `src/tokens.ts` | the token contract: the kit fixes the names, each project its values |
| `src/utils.ts` | the shared helpers (`cn`) |
| `bin/house-kit.mjs` | `init` starts a project, `check` tests the contract |
| `template/` | what `init` writes |

## Start a project

Needs read access to this repo, and git signed in to GitHub.

```bash
pnpm dlx github:Flutgraben-e-V/house-kit init my-project
```

Then `cd my-project`, `git init`, `pnpm install`, `pnpm gates`, `pnpm dev`.

## Update a project

```bash
pnpm update @flutgraben/house-kit
```

Then `pnpm gates`. `house-kit check` (inside `pnpm gates`) says when a newer kit
exists and when a project has drifted from a house pin.

## Release a change

1. Make the change on a branch, with a changeset: `pnpm changeset`.
2. Merge the pull request.
3. On `main`, on your machine: `pnpm release`, then
   `git push --follow-tags`. That raises the version, writes the changelog and
   tags `vX.Y.Z`; projects pick the tag up by version range.

There is no CI and no publish job: a release is that one local command.

## Hostinger

A project builds with `pnpm build:hostinger` and starts with
`pnpm start:hostinger`. Installing this private package on the build box needs a
read-only GitHub key for this repo, set on the site. A raised Next.js pin must
pass the glibc check in house-code's `platform.md` (H1) before it is released.
