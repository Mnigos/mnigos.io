# Architecture

A single Astro 7 package that builds a fully static site: every page, the sitemap and the RSS feed are rendered at build time into `dist/`. There is no server and no client framework. Rules: [AGENTS.md](AGENTS.md). Decisions: [docs/decisions](docs/decisions).

## Layout

| Path                    | What it is                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/<module>/` | One feature area, split into the layer folders it needs: `domain/`, `infrastructure/`, `presentation/`, `content/`. For example `site` (layout, home page) and `blog` (post query, post helpers, blog pages, RSS handler).                                        |
| `src/pages/`            | Thin route files. Each renders a module component or re-exports a module handler; `blog/[id].astro` re-exports `getStaticPaths` from the blog query.                                                                                                              |
| `src/content/blog/`     | Posts as Markdown or MDX. The file name is the slug.                                                                                                                                                                                                              |
| `src/content.config.ts` | The `blog` collection and its Zod schema, where Astro looks for it.                                                                                                                                                                                               |
| `src/styles/`           | `global.css` holds the Tailwind 4 theme, utilities, and post prose and code block styles; Tailwind scans only `src/` for class names. `link-stroke.svg` is the link stroke, which Vite inlines into the stylesheet.                                               |
| `tooling/`              | `oxlint-plugin/` holds the `mnigos/*` oxlint rules, loaded through `jsPlugins` in `oxlint.config.mts`: file roles, role folders, module layout and code style. `styles/` checks the stylesheet's assets, such as the link stroke colour against the accent token. |
| `scripts/`              | Bun scripts. `check-files.ts` runs in `bun run check`: no em or en dashes in tracked files, and `.astro` component names and folders.                                                                                                                             |
| `public/`               | Files copied to `dist/` as they are, such as the favicon.                                                                                                                                                                                                         |
| `wrangler.jsonc`        | The static-assets-only Cloudflare Worker `mnigos-io` that serves `dist/`. Builds, Previews and rollbacks: [docs/deploy.md](docs/deploy.md).                                                                                                                       |
| `docs/decisions/`       | Architecture decision records.                                                                                                                                                                                                                                    |

Outside `src/modules/`, `src/` holds only `src/content.config.ts` with its spec, `src/pages/`, `src/content/`, `src/styles/` and `*.d.ts` files, and lint fails on any other TypeScript file there. Specs sit next to the file they test as `<name>.spec.ts` in `src/`, `tooling/` and `scripts/`, and `bun run test` runs all of them.

## Build-time data flow

1. Astro loads the `blog` collection from `src/content/blog/` and validates each post's frontmatter against the schema in `src/content.config.ts`.
2. `infrastructure/` reads the outside world at build time: `blog/infrastructure/posts.query.ts` returns the published posts and the post paths with each post's neighbours. Other build-time reads, such as `fetch` or files, belong here too.
3. `domain/` shapes the data with pure functions: `blog/domain/post.helper.ts` sorts posts newest first, formats their dates, counts reading time and finds each post's older and newer neighbour.
4. `presentation/` renders it: `.astro` components wrap the content in `site/presentation/layout.astro`, and `blog/presentation/rss.handler.ts` builds the feed. Code blocks are highlighted at build time by Shiki with `blog/presentation/code-theme.config.ts`, whose colours are the site's CSS variables.
5. `src/pages/` maps each URL to one of those components or handlers, and `astro build` writes static HTML, `rss.xml` and the sitemap into `dist/`.

## Contribution data

The home page grid and the yearly totals show GitHub and GitLab contributions added per day. `loadContributionYears` in `contributions/infrastructure/contributions.client.ts` is the only place that combines them, so every page that reads it gets the combined numbers.

- GitHub: the contribution calendar from the GitHub GraphQL API, one request per year from 2021. With `GH_CONTRIBUTIONS_TOKEN` set the build fetches it, otherwise it reads the committed `contributions.snapshot.json`. `bun run contributions:refresh` rewrites that snapshot and touches only GitHub data.
- GitLab: `gitlab-events.snapshot.json` holds daily event counts from the gitlab.com events API for the account Igor used at Tenset, fetched on 2026-11-25. A day counts commits, merge requests opened, issues opened and approvals.
- Gaps: GitLab keeps events for 5 years, so days before 2021-12-08 were already deleted. The self-hosted GitLab used after mid January 2024 was never available, so nothing after 2024-01-16 is counted.
- Commit counts come from push events, so a rebased and force-pushed branch can count the same commit again.
- The GitLab file is the only durable copy of this data. It keeps all ten event counts per day, and neither the build nor the refresh script regenerates it.

## Decision records

- [0001: Naming and layering conventions](docs/decisions/0001-naming-and-layering-conventions.md)
