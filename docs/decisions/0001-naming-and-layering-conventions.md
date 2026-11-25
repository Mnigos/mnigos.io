# ADR 0001: Naming and layering conventions

**Status:** Accepted
**Date:** 2026-11-25

## Context

The site started as an Astro skeleton with pages, a layout and the post query mixed together under `src/pages/` and `src/layouts/`. More code is coming, such as a build-time contribution grid and typed profile content, and agents and humans need one predictable answer to "where does this file go and what is it", checked by tooling rather than review. Soonlane already has such conventions (its ADR 0001), but it is a Turborepo with a TanStack Start app, an API and shared packages.

## Decision

- Stay a single Astro package at the repository root. No workspaces, no `apps/` or `packages/`, no client framework. A static personal site has one build and one deploy target, so Soonlane's Turborepo with TanStack Start would add packages and tooling without a second consumer for any of them.
- Code lives in `src/modules/<module>/` with the layer folders it needs: `domain/` (pure TypeScript, no Astro or I/O), `infrastructure/` (build-time reads: `astro:content`, `fetch`, files), `presentation/` (`.astro` components, endpoint handlers) and `content/` (typed content data). Soonlane's `application/` layer is left out, because a static build has no services or ports to swap.
- Every source file under `src/` sits in a module layer, except the files Astro places itself: `src/content.config.ts` with its spec, the route files in `src/pages/` and any `*.d.ts`.
- `src/pages/` keeps only thin route files that render a module component or re-export a module handler or `getStaticPaths`.
- Every `.ts` file under `src/` is `<kebab-name>.<role>.ts` (optionally `.spec` before `.ts`) with a role from the closed table in `AGENTS.md`, adapted from Soonlane's. `client`, `query`, `repository`, `mapper` and `snapshot` belong in `infrastructure/`, `content` in `content/` and `handler` in `presentation/`. `.astro` components are bare kebab-case and live only in `presentation/`.
- The `mnigos/*` rules in `tooling/oxlint-plugin/` enforce names, role folders and module layout (`file-role-suffix`, `file-role-folder`, `module-layout`), copied from Soonlane's plugin as plain files with no package of their own. `scripts/check-files.ts` checks `.astro` names and folders and bans em dashes and en dashes in tracked files. Both run in `bun run check`.

## Consequences

- A file's role and allowed folder are readable from its name, and `bun run check` fails on drift instead of review catching it.
- oxlint covers `.astro` files only in part: it lints the frontmatter and `<script>` tags but not template expressions, type-aware rules do not run on `.astro` at all, and oxfmt does not format `.astro`. `astro check` stays the only type check for templates.
- oxlint skips an `.astro` file without frontmatter entirely, so `.astro` names and folders are checked in `scripts/check-files.ts` instead of the lint plugin. The script reads `git ls-files`, so a new component is checked once it is added to git.
- Domain purity (no Astro imports, no I/O in `domain/`) is a convention that review checks; no lint rule enforces it yet.
- Renaming a role or a layer means updating `tooling/oxlint-plugin/helpers/file-role.helper.mts`, `scripts/check-files.ts` and `AGENTS.md` together.

## Related

- `AGENTS.md`: Boundaries and Code
- `ARCHITECTURE.md`: layout and build-time data flow
- Soonlane ADR 0001, whose naming and layering this one adapts
