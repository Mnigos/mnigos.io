import { z } from 'zod'
import { getCommitYears } from '../domain/commit-days.helper'
import { TOKEN_EXPIRATION_HEADER } from './contributions.client'
import archive from './rigtch-fm-archive-commits.snapshot.json'
import monorepo from './rigtch-fm-commits.snapshot.json'

const COMMITS_URL =
	'https://api.github.com/repos/Rigtch/rigtch.fm/commits?author=Mnigos&per_page=100'
const NEXT_PAGE_PATTERN = /<([^>]+)>;\s*rel="next"/u

const commitListSchema = z.array(
	z.object({
		commit: z.object({
			author: z.object({ date: z.iso.datetime({ offset: true }) }),
		}),
	})
)

/** Carries only the HTTP status, because the refresh logs are public. */
export class RigtchFmResponseError extends Error {
	override name = 'RigtchFmResponseError'

	constructor(status: number) {
		super(`HTTP ${status}`)
	}
}

async function fetchCommitPages(
	url: string,
	token: string,
	request: typeof fetch
): Promise<Response[]> {
	const response = await request(url, {
		headers: {
			accept: 'application/vnd.github+json',
			authorization: `Bearer ${token}`,
			'x-github-api-version': '2022-11-28',
		},
	})

	if (!response.ok) throw new RigtchFmResponseError(response.status)

	const next = NEXT_PAGE_PATTERN.exec(response.headers.get('link') ?? '')?.[1]

	return next
		? [response, ...(await fetchCommitPages(next, token, request))]
		: [response]
}

/** Commits by the GitHub login Mnigos on the default branch of the monorepo, counted on their author date in UTC. */
export async function fetchRigtchFmCommitDays(
	token: string,
	request: typeof fetch = fetch
) {
	const pages = await fetchCommitPages(COMMITS_URL, token, request)
	const commits = await Promise.all(
		pages.map(async page => commitListSchema.parse(await page.json()))
	)
	const dates = commits
		.flat()
		.map(({ commit }) =>
			new Date(commit.author.date).toISOString().slice(0, 10)
		)
		.toSorted()
	const days: Record<string, number> = {}

	for (const date of dates) days[date] = (days[date] ?? 0) + 1

	return {
		days,
		tokenExpiration:
			pages[0]?.headers.get(TOKEN_EXPIRATION_HEADER) ?? undefined,
	}
}

/** The frozen archive snapshot plus the daily monorepo snapshot. The repositories share no commit, so each commit counts once. */
export function loadRigtchFmCommitYears() {
	return getCommitYears([archive.days, monorepo.days])
}
