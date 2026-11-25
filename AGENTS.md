# mnigos.io agent rules

Igor Makowski's personal site and blog: a static Astro 7 site with MDX posts, Tailwind 4 and Bun, one package at the repository root; oxlint and oxfmt through Ultracite, Vitest for unit tests. Map: `ARCHITECTURE.md`. Decisions: `docs/decisions`.

## Must

- Commit only when asked. Conventional commits (commitlint runs in the `commit-msg` hook); never `--no-verify`. No AI attribution anywhere: no `Co-Authored-By`, no "Generated with".
- Bun only: `bun install`, `bun run <script>`, `bunx`. Never npm, yarn or pnpm.
- Do not start a dev server; assume one is running.
- This repository is public. Nothing from `mockups/`, no personal brand material and no content the owner has not approved is ever committed. No secrets, tokens or `.env` files.

## Commands

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `bun run dev`       | Astro dev server at `localhost:4321`                        |
| `bun run build`     | Static build into `dist/`                                   |
| `bun run typecheck` | `astro check`                                               |
| `bun run check`     | Ultracite (oxlint and oxfmt), then `scripts/check-files.ts` |
| `bun run check:fix` | Ultracite fixes, unsafe ones included                       |
| `bun run test`      | Vitest, every `*.spec.ts` in `src/`, `tooling/`, `scripts/` |

## Boundaries

- Code lives in `src/modules/<module>/`, a kebab-case folder that holds files only inside its layer folders (lint-enforced):
  - `domain/`: pure TypeScript. No Astro imports, no `astro:*` virtual modules, no I/O.
  - `infrastructure/`: reads the outside world at build time: `astro:content`, `fetch`, files.
  - `presentation/`: `.astro` components and pages, endpoint handlers.
  - `content/`: typed content data.
- Every lintable file under `src/` sits in a module layer, except the files Astro places itself: `src/content.config.ts` with its spec, the route files in `src/pages/` and any `*.d.ts`. (lint-enforced)
- A module has only the layers it needs: no empty folders, no files at the module root. A module may import another module's files directly; there is no index file.
- `src/pages/` holds only thin route files: each imports a module component or handler and renders or re-exports it, plus what Astro needs in the route file itself. `src/content.config.ts`, the posts in `src/content/blog/` and `src/styles/global.css` stay where they are.

## Code

- File names: every `.ts` file under `src/` is `<kebab-name>.<role>.ts`, optionally with `.spec` before `.ts` for its tests, with a role from `client, config, constants, content, errors, handler, helper, mapper, parser, query, repository, schema, schemas, service, snapshot, types, util`. A file that belongs to another carries both roles, the kind last: `github.client.types.ts`. Files Astro names itself are exempt: `src/content.config.ts` and the route files in `src/pages/`. (lint-enforced)
- Folder rules: `client`, `query`, `repository`, `mapper` and `snapshot` live only in `infrastructure/`, `content` only in `content/`, `handler` only in `presentation/`; the other roles fit any layer. Both roles of a two-role name count. (lint-enforced)
- `.astro` components are bare kebab-case (`post-page.astro`) and live only in a module's `presentation/`; route files in `src/pages/` are exempt. (enforced by `scripts/check-files.ts`)
- No `export default`; every export is named. The only exceptions are files a tool loads through their default export, listed in the `import/no-default-export` override in `oxlint.config.mts`. (lint-enforced)
- One import statement per module; types and values together use `type` inside the braces (`import { type CollectionEntry, render } from 'astro:content'`). (lint-enforced)
- A parameter's type is named: an interface, a type alias or a type derived from one, never an inline object type. (lint-enforced)
- No `let` inside functions: use `const` and move the use into the block that assigns the value, return early, or extract a function. Module-level state and loop heads may use `let`. (lint-enforced)
- Type parameters are `T` or `T` followed by a PascalCase name (`TPost`). (lint-enforced)
- Consecutive single-line module-level `const` declarations stay together without blank lines. (lint-enforced)
- Implementation files stay under 400 lines. (lint-enforced)
- Comments are one line and only say a why the code cannot show, about four per file at most. No narration, no history, no comment that restates a signature. A comment directly above a module-level declaration is JSDoc (`/** ... */`), never `//`. (lint-enforced)
- Run `bun run check:fix`; the `mnigos/*` rules in `tooling/oxlint-plugin` enforce the rest of the style.

## Writing

Never use em dashes or en dashes anywhere in this repository, including code, comments, copy, commit messages and pull request text. End the sentence or use a comma instead. `bun run check` fails on either character in a tracked file.

## Astro

When asked to start the dev server, use background mode: `astro dev --background`, and manage it with `astro dev stop`, `astro dev status` and `astro dev logs`.

Full documentation: https://docs.astro.build. Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
