# mnigos.io

Personal portfolio and blog. Built with [Astro](https://astro.build), Tailwind CSS, and MDX.

## Stack

- Astro 7 for static site generation and content collections
- Tailwind CSS 4 for styling, with `@tailwindcss/typography` for post content
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
