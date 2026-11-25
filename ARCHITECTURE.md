# Architecture

A single Astro 7 package that builds a fully static site: every page, the sitemap and the RSS feed are rendered at build time into `dist/`. There is no server and no client framework. Rules: [AGENTS.md](AGENTS.md). Decisions: [docs/decisions](docs/decisions).

## Layout

| Path                     | What it is                                                                                                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/<module>/`  | One feature area, split into the layer folders it needs: `domain/`, `infrastructure/`, `presentation/`, `content/`. For example `site` (layout, home page) and `blog` (post query, post helpers, blog pages, RSS handler). |
| `src/pages/`             | Thin route files. Each renders a module component or re-exports a module handler; `blog/[id].astro` re-exports `getStaticPaths` from the blog query.                                                                       |
| `src/content/blog/`      | Posts as Markdown or MDX. The file name is the slug.                                                                                                                                                                       |
| `src/content.config.ts`  | The `blog` collection and its Zod schema, where Astro looks for it.                                                                                                                                                        |
| `src/styles/global.css`  | Tailwind 4 theme, utilities and prose colors. Tailwind scans only `src/` for class names.                                                                                                                                  |
| `tooling/oxlint-plugin/` | The `mnigos/*` oxlint rules, loaded through `jsPlugins` in `oxlint.config.mts`: file roles, role folders, module layout and code style.                                                                                    |
| `scripts/`               | Bun scripts. `check-files.ts` runs in `bun run check`: no em or en dashes in tracked files, and `.astro` component names and folders.                                                                                      |
| `public/`                | Files copied to `dist/` as they are, such as the favicon.                                                                                                                                                                  |
| `docs/decisions/`        | Architecture decision records.                                                                                                                                                                                             |

Outside `src/modules/`, `src/` holds only `src/content.config.ts` with its spec, `src/pages/`, `src/content/`, `src/styles/` and `*.d.ts` files, and lint fails on any other TypeScript file there. Specs sit next to the file they test as `<name>.spec.ts` in `src/`, `tooling/` and `scripts/`, and `bun run test` runs all of them.

## Build-time data flow

1. Astro loads the `blog` collection from `src/content/blog/` and validates each post's frontmatter against the schema in `src/content.config.ts`.
2. `infrastructure/` reads the outside world at build time: `blog/infrastructure/posts.query.ts` returns the published posts and the post paths. Other build-time reads, such as `fetch` or files, belong here too.
3. `domain/` shapes the data with pure functions: `blog/domain/post.helper.ts` sorts posts newest first and formats their dates.
4. `presentation/` renders it: `.astro` components wrap the content in `site/presentation/layout.astro`, and `blog/presentation/rss.handler.ts` builds the feed.
5. `src/pages/` maps each URL to one of those components or handlers, and `astro build` writes static HTML, `rss.xml` and the sitemap into `dist/`.

## Decision records

- [0001: Naming and layering conventions](docs/decisions/0001-naming-and-layering-conventions.md)
