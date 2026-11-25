# Deploy

The site runs as a static-assets-only Cloudflare Worker named `mnigos-io`. There is no Worker code: `wrangler.jsonc` points Cloudflare at `./dist` and Cloudflare serves those files. Workers Builds, Cloudflare's Git integration, builds and deploys every push. No GitHub Actions workflow runs the deploy.

## What runs on a push

- A push to `main` runs `bun run build`, then `npx wrangler deploy`, which makes the new build the production version.
- A push to any other branch runs `bun run build`, then `npx wrangler preview`, which uploads the build as a Preview of the same Worker. Production does not change.
- On a pull request, Cloudflare reports the build as a GitHub check run and posts a comment with the build status and the Preview URL.

Workers Builds uses the Wrangler version pinned in `package.json`. Previews need Wrangler 4.135.0 or later, so keep the pin at or above that when updating it.

## Dashboard settings

Set these once under Workers & Pages, the `mnigos-io` Worker, Settings, Build:

| Setting                               | Value                           |
| ------------------------------------- | ------------------------------- |
| Git repository                        | `Mnigos/mnigos.io`              |
| Git branch                            | `main`, the production branch   |
| Build command                         | `bun run build`                 |
| Deploy command                        | default, `npx wrangler deploy`  |
| Preview command                       | default, `npx wrangler preview` |
| Root directory                        | empty, the repository root      |
| Branch control, Enable Preview Builds | on                              |

The Worker name in the dashboard must match `name` in `wrangler.jsonc`, or the build fails.

`GH_CONTRIBUTIONS_TOKEN` is the only build secret, and it is optional. With it, the build fetches the contribution calendar from GitHub and fails if that fetch fails. Without it, the build reads the snapshot committed in `src/modules/contributions/`, so a build with no secrets at all still passes. Add it under Settings, Build, Build variables and secrets, never as a Worker variable and never in the repository.

## Previews

A Preview gets its own URL, `<preview-name>-mnigos-io.<subdomain>.workers.dev`, where the preview name comes from the branch. `wrangler preview` refuses to run without a `previews` block in `wrangler.jsonc`, so the file keeps an empty one. Assets and the compatibility date stay at the top level and apply to Previews too.

`public/_headers` sends `X-Robots-Tag: noindex` on every `https://:version.:subdomain.workers.dev/*` URL. Astro copies it into `dist/`, and Cloudflare applies it to every asset response. Every `workers.dev` hostname of this Worker has two labels before `workers.dev` (production, Previews, version and deployment URLs alike), so this one rule keeps all of them out of search results. The custom domain does not match the rule and stays indexable.

## Missing pages

`not_found_handling` is `404-page`. A request that matches no file gets the nearest `404.html` with status 404, searching up from the requested path. Until the site has a `404.html`, Cloudflare answers with an empty 404.

## Rolling back

In the dashboard, open Workers & Pages, select `mnigos-io`, then Deployments. Open the three-dot menu on the version to restore and select Rollback. From a machine logged in to the Cloudflare account, `bunx wrangler rollback` does the same, with an optional version ID to pick a specific version. Cloudflare keeps the 100 most recent versions as rollback targets, and may delete versions older than 30 days.

A rollback changes only the live version. The next push to `main` deploys again, so revert the commit as well when the bad change is in the code.

## Checking a change locally

`bun run build` followed by `bunx wrangler deploy --dry-run` reads `wrangler.jsonc` and `dist/` and stops before uploading anything. It needs no login.
