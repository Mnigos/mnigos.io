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

The build has no secrets. Cloudflare never gets `GH_CONTRIBUTIONS_TOKEN`, so every build reads the contribution snapshot committed in `src/modules/contributions/infrastructure/`, which the daily refresh below keeps current.

## Daily contribution refresh

`.github/workflows/refresh-contributions.yml` runs every day at 04:17 UTC, and on demand with `gh workflow run refresh-contributions.yml --repo Mnigos/mnigos.io`. It runs `bun run contributions:refresh` with the repository secret `GH_CONTRIBUTIONS_TOKEN`. The script leaves the snapshot untouched when the GitHub numbers are the same, so a quiet day ends without a commit. When they changed, the job runs `bun run check` and `bun run test`, commits the snapshot as `github-actions[bot]`, rebases it onto the latest `main` and pushes, with one retry when the push is rejected. It never force-pushes, and a conflict on the snapshot fails the run with `main` left as it was.

- CI does not run on the bot commit, because GitHub starts no workflow for a push made with a workflow's `GITHUB_TOKEN`. The check and test steps in the refresh job cover it instead. The job does not build: a build that fails on Cloudflare keeps the previous version live.
- Workers Builds still deploys the bot commit. Cloudflare's GitHub App starts a build for every push to `main`, whoever pushed it.
- GitHub disables a scheduled workflow in a public repository after 60 days without repository activity. The bot commits only on days the numbers change, and GitHub does not document whether bot commits count, so a long quiet stretch can switch the refresh off. Turn it back on under Actions, Refresh contributions, Enable workflow, or with `gh workflow enable refresh-contributions.yml --repo Mnigos/mnigos.io`.
- GitHub emails a failed scheduled run only to whoever last changed the `cron` line in the workflow.

### The token

`GH_CONTRIBUTIONS_TOKEN` is a classic personal access token with only the `read:user` scope, stored as an Actions repository secret. The current one expires on 2026-12-25. Each run logs the expiry date that GitHub sends in the `github-authentication-token-expiration` response header, and adds a warning to the run summary when fewer than 14 days are left. A warning sends no email; the run fails only once the token stops working.

To rotate it:

1. Create a classic token at https://github.com/settings/tokens/new with only the `read:user` scope and an expiry date.
2. Run `gh secret set GH_CONTRIBUTIONS_TOKEN --repo Mnigos/mnigos.io` and paste the token.
3. Run the workflow with `gh workflow run refresh-contributions.yml --repo Mnigos/mnigos.io` and check that it passes.

When GitHub rejects the token with HTTP 401, the run fails with a message that names the secret and these steps.

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
