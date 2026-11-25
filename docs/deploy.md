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

The build has no secrets. Cloudflare never gets `GH_CONTRIBUTIONS_TOKEN` or `RIGTCH_REPO_TOKEN`, so every build reads the contribution snapshots committed in `src/modules/contributions/infrastructure/`, which the daily refresh below keeps current.

## Daily contribution refresh

`.github/workflows/refresh-contributions.yml` runs every day at 04:17 UTC, and on demand with `gh workflow run refresh-contributions.yml --repo Mnigos/mnigos.io`. It runs `bun run contributions:refresh` with the repository secrets `GH_CONTRIBUTIONS_TOKEN` and `RIGTCH_REPO_TOKEN`. The script refreshes the GitHub contribution snapshot, then the rigtch.fm commit snapshot, and leaves each one untouched when its numbers are the same, so a quiet day ends without a commit. When either changed, the job runs `bun run check` and `bun run test`, commits both snapshots as `github-actions[bot]`, rebases the commit onto the latest `main` and pushes, with one retry when the push is rejected. It never force-pushes, and a conflict on a snapshot fails the run with `main` left as it was.

- CI does not run on the bot commit, because GitHub starts no workflow for a push made with a workflow's `GITHUB_TOKEN`. The check and test steps in the refresh job cover it instead. The job does not build: a build that fails on Cloudflare keeps the previous version live.
- Workers Builds still deploys the bot commit. Cloudflare's GitHub App starts a build for every push to `main`, whoever pushed it.
- GitHub disables a scheduled workflow in a public repository after 60 days without repository activity. The bot commits only on days the numbers change, and GitHub does not document whether bot commits count, so a long quiet stretch can switch the refresh off. Turn it back on under Actions, Refresh contributions, Enable workflow, or with `gh workflow enable refresh-contributions.yml --repo Mnigos/mnigos.io`.
- GitHub emails a failed scheduled run only to whoever last changed the `cron` line in the workflow.

### GH_CONTRIBUTIONS_TOKEN

`GH_CONTRIBUTIONS_TOKEN` is a classic personal access token with only the `read:user` scope, stored as an Actions repository secret. The current one expires on 2026-12-25. Each run logs the expiry date that GitHub sends in the `github-authentication-token-expiration` response header, and adds a warning to the run summary when fewer than 14 days are left. A warning sends no email; the run fails only once the token stops working.

To rotate it:

1. Create a classic token at https://github.com/settings/tokens/new with only the `read:user` scope and an expiry date.
2. Run `gh secret set GH_CONTRIBUTIONS_TOKEN --repo Mnigos/mnigos.io` and paste the token.
3. Run the workflow with `gh workflow run refresh-contributions.yml --repo Mnigos/mnigos.io` and check that it passes.

When GitHub rejects the token with HTTP 401, the run fails with a message that names the secret and these steps.

### RIGTCH_REPO_TOKEN

`RIGTCH_REPO_TOKEN` is a fine-grained personal access token with resource owner `Rigtch`, access to `Rigtch/rigtch.fm` only and the repository permission Contents read-only, stored as an Actions repository secret. The current one expires on 2026-12-25. The refresh reads the commit list of `Rigtch/rigtch.fm` with it; the archived rigtch.fm repositories are a committed snapshot and need no token. Each run logs its expiry the same way as for `GH_CONTRIBUTIONS_TOKEN`, with a warning on the run summary when fewer than 14 days are left.

When the secret is missing, expired or refused, or the request fails, the run keeps the last saved rigtch.fm numbers, still refreshes the GitHub snapshot and does not fail. It adds a warning to the run summary that names the secret, the HTTP status if there was one, and the steps below. The log shows only per-year totals and the status, never a response body or the token.

To rotate it:

1. Create a fine-grained token at https://github.com/settings/personal-access-tokens/new with resource owner `Rigtch`, only the repository `Rigtch/rigtch.fm`, the permission Contents read-only and an expiry date.
2. Run `gh secret set RIGTCH_REPO_TOKEN --repo Mnigos/mnigos.io` and paste the token.
3. Run the workflow with `gh workflow run refresh-contributions.yml --repo Mnigos/mnigos.io` and check that the run summary has no warning about `RIGTCH_REPO_TOKEN`.

## Previews

A Preview gets its own URL, `<preview-name>-mnigos-io.<subdomain>.workers.dev`, where the preview name comes from the branch. `wrangler preview` refuses to run without a `previews` block in `wrangler.jsonc`, so the file keeps an empty one. Assets and the compatibility date stay at the top level and apply to Previews too.

`public/_headers` sends `X-Robots-Tag: noindex` on every `https://:version.:subdomain.workers.dev/*` URL. Astro copies it into `dist/`, and Cloudflare applies it to every asset response. Every `workers.dev` hostname of this Worker has two labels before `workers.dev` (production, Previews, version and deployment URLs alike), so this one rule keeps all of them out of search results. `mnigos.io` and `www.mnigos.io` do not match the rule and stay indexable.

## Domain

`mnigos.io` and `www.mnigos.io` are Custom Domains of the Worker, listed under `routes` in `wrangler.jsonc` with `custom_domain: true`. Cloudflare keeps a proxied DNS record for each one and issues its certificate. Every `wrangler deploy` sends the whole list and detaches any Custom Domain of this Worker that the list no longer names, so `wrangler.jsonc` is the source of truth. A deploy from a config without any `routes` leaves the attached domains alone.

Declaring routes switches `workers.dev` off by default, so the file sets `workers_dev` and `preview_urls` to `true`. The production `workers.dev` URL and the Previews stay as they were.

A Custom Domain cannot share its hostname with another DNS record. The dashboard refuses while such a record exists, and an interactive `wrangler deploy` asks first. Without a terminal, as in Workers Builds, Wrangler asks Cloudflare to replace the record, but the Workers Builds token has no DNS permission, so that path is untested. To add a hostname that has a record, delete the record and add the Custom Domain in the dashboard right after, then list it in `wrangler.jsonc`.

### www and plain HTTP

One Single Redirect rule in the zone, under Rules, Redirect Rules, sends `www` and plain HTTP to the canonical address. It lives in Cloudflare, not in this repository.

| Field        | Value                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| Name         | `mnigos.io canonical host`                                                 |
| Expression   | `(http.host eq "www.mnigos.io") or (http.host eq "mnigos.io" and not ssl)` |
| Target URL   | `concat("https://mnigos.io", http.request.uri.path)`                       |
| Status       | 301                                                                        |
| Query string | preserved                                                                  |

Redirect rules run before the request reaches the Worker, because a Worker on a Custom Domain is the origin for its hostname. The zone setting Always Use HTTPS stays off, so the rule covers plain HTTP for these two hostnames only and `http://www` reaches `https://mnigos.io` in one hop.

### Mail and other records

Mail runs through OVH: the MX records and the SPF record do not depend on the site's records and do not change with it. `ftp.mnigos.io` is a CNAME of the apex and follows it to Cloudflare, where nothing answers for it. `winyle.mnigos.io` belongs to another project.

### Detaching the domain

To take the site off the domain and bring back the OVH parking page:

1. Remove the two `routes` entries from `wrangler.jsonc` and push to `main`. The deploy leaves the attached domains alone, but no later deploy attaches them again. Wait until this build succeeds and no older production build is queued or running under Workers & Pages, `mnigos-io`, Deployments, because an older build still has the routes and would attach the domains again over the restored records.
2. In the dashboard, open Workers & Pages, `mnigos-io`, Settings, Domains & Routes, and remove `mnigos.io` and `www.mnigos.io`. Cloudflare deletes the DNS records it created for them; check under DNS, Records that neither hostname has a record left.
3. Under DNS, Records, add an `A` record for `mnigos.io` and one for `www.mnigos.io`, both `213.186.33.5`, DNS only, TTL Auto.
4. Delete the redirect rule `mnigos.io canonical host`.
5. Under SSL/TLS, Edge Certificates, delete the certificates Cloudflare ordered for the two hostnames; removing a Custom Domain does not delete them.

Steps 2 and 3 follow each other within a minute, since the hostnames do not resolve in between.

## Missing pages

`not_found_handling` is `404-page`. A request that matches no file gets the nearest `404.html` with status 404, searching up from the requested path. Until the site has a `404.html`, Cloudflare answers with an empty 404.

## Rolling back

In the dashboard, open Workers & Pages, select `mnigos-io`, then Deployments. Open the three-dot menu on the version to restore and select Rollback. From a machine logged in to the Cloudflare account, `bunx wrangler rollback` does the same, with an optional version ID to pick a specific version. Cloudflare keeps the 100 most recent versions as rollback targets, and may delete versions older than 30 days.

A rollback changes only the live version. The next push to `main` deploys again, so revert the commit as well when the bad change is in the code.

## Checking a change locally

`bun run build` followed by `bunx wrangler deploy --dry-run` reads `wrangler.jsonc` and `dist/` and stops before uploading anything. It needs no login.
