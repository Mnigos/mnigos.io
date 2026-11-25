# mnigos.io

Personal portfolio and blog. Built with [Astro](https://astro.build), Tailwind CSS, and MDX.

## Stack

- Astro 7 for static site generation and content collections
- Tailwind CSS 4 for styling; post content and code colours come from the site tokens in `src/styles/global.css`
- MDX for blog posts, which live in `src/content/blog/`
- Bun as package manager and runtime

## Commands

| Command             | Action                               |
| ------------------- | ------------------------------------ |
| `bun install`       | Install dependencies                 |
| `bun run dev`       | Start dev server at `localhost:4321` |
| `bun run build`     | Build static site to `./dist/`       |
| `bun run preview`   | Preview the production build         |
| `bun run typecheck` | Run `astro check`                    |

## Contributions

The build reads the GitHub contribution calendar from `src/modules/contributions/`. With `GH_CONTRIBUTIONS_TOKEN` set it fetches the calendar from the GitHub GraphQL API and fails if the fetch fails. Without it, it reads the committed snapshot. Refresh the snapshot with `GH_CONTRIBUTIONS_TOKEN=$(gh auth token) bun run contributions:refresh`.

## Deploy

Cloudflare Workers Builds deploys every push to `main` and gives every other branch a Preview. Settings and rollbacks: [docs/deploy.md](docs/deploy.md).

## Writing a post

Add an `.mdx` (or `.md`) file to `src/content/blog/` with frontmatter:

```yaml
---
title: Post title
description: Short summary shown in listings and meta tags.
publishedAt: 2026-07-08
tags: [tag]
draft: false # optional, hides the post everywhere
---
```

The filename becomes the slug (`/blog/<filename>`). Posts feed the homepage, `/blog`, the sitemap, and `/rss.xml`.
