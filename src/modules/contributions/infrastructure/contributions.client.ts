import { GraphqlResponseError, graphql } from '@octokit/graphql'
import type { ContributionYear } from '../domain/contribution.types'
import { addGitLabContributions } from '../domain/gitlab-contributions.helper'
import { getDayOfYear, getDaysInYear } from '../domain/iso-date.helper'
import { env } from './contributions.config'
import gitLabEvents from './gitlab-events.snapshot.json'

const FIRST_YEAR = 2021
export const TOKEN_EXPIRATION_HEADER = 'github-authentication-token-expiration'
const TOKEN_REJECTED =
	'GitHub rejected GH_CONTRIBUTIONS_TOKEN. Create a classic token with the read:user scope, store it with `gh secret set GH_CONTRIBUTIONS_TOKEN --repo Mnigos/mnigos.io`, then rerun the workflow (docs/deploy.md)'
const CALENDAR_QUERY = `query ($from: DateTime!, $to: DateTime!) {
	viewer {
		contributionsCollection(from: $from, to: $to) {
			contributionCalendar {
				totalContributions
				weeks { contributionDays { date contributionCount } }
			}
		}
	}
}`

interface ContributionDay {
	date: string
	contributionCount: number
}

interface CalendarQuery {
	viewer: {
		contributionsCollection: {
			contributionCalendar: {
				totalContributions: number
				weeks: { contributionDays: ContributionDay[] }[]
			}
		}
	}
}

function describeFailure(error: unknown) {
	if (error instanceof GraphqlResponseError)
		return error.errors?.map(({ message }) => message).join('; ')
	if (
		error instanceof Error &&
		'response' in error &&
		error.response &&
		'status' in error
	)
		return error.status === 401
			? `HTTP 401, ${TOKEN_REJECTED}`
			: `HTTP ${String(error.status)}`
	return String(error)
}

async function requestCalendar(year: number, request: typeof graphql) {
	try {
		return await request<CalendarQuery | null>(CALENDAR_QUERY, {
			from: `${year}-01-01T00:00:00Z`,
			to: `${year}-12-31T23:59:59Z`,
		})
	} catch (error) {
		throw new Error(`GitHub contributions ${year}: ${describeFailure(error)}`, {
			cause: error,
		})
	}
}

async function fetchContributionYear(
	year: number,
	request: typeof graphql
): Promise<ContributionYear> {
	const data = await requestCalendar(year, request)
	const calendar = data?.viewer.contributionsCollection.contributionCalendar

	if (!calendar)
		throw new Error(`GitHub contributions ${year}: no calendar in the response`)

	const counts = Array.from({ length: getDaysInYear(year) }, () => 0)

	for (const { date, contributionCount } of calendar.weeks.flatMap(
		week => week.contributionDays
	))
		if (date.startsWith(`${year}-`))
			counts[getDayOfYear(date)] = contributionCount

	return { year, total: calendar.totalContributions, counts }
}

/** One calendar year per request, from 2021 to the current year, with the token's expiration header if GitHub sent one. */
export async function fetchContributionYears(token: string) {
	const years = Array.from(
		{ length: new Date().getUTCFullYear() - FIRST_YEAR + 1 },
		(_, index) => FIRST_YEAR + index
	)
	const expirations: (string | undefined)[] = []

	const request = graphql.defaults({
		headers: { authorization: `bearer ${token}` },
		request: {
			fetch: async (...args: Parameters<typeof fetch>) => {
				const response = await fetch(...args)

				expirations.push(
					response.headers.get(TOKEN_EXPIRATION_HEADER) ?? undefined
				)
				return response
			},
		},
	})

	return {
		years: await Promise.all(
			years.map(async year => await fetchContributionYear(year, request))
		),
		tokenExpiration: expirations[0],
	}
}

/** The committed GitHub snapshot plus the GitLab snapshot per day, without any request. */
export async function loadSnapshotContributionYears() {
	const { default: snapshot } = await import('./contributions.snapshot.json')

	return {
		generatedAt: snapshot.generatedAt,
		years: addGitLabContributions(snapshot.years, gitLabEvents.days),
	}
}

/** GitHub contributions plus the GitLab snapshot per day. Fetches from GitHub when `GH_CONTRIBUTIONS_TOKEN` is set, so a failing fetch fails the build; otherwise reads the committed snapshot. */
export async function loadContributionYears(): Promise<ContributionYear[]> {
	const token = env.GH_CONTRIBUTIONS_TOKEN

	if (!token) {
		const { generatedAt, years } = await loadSnapshotContributionYears()

		console.info(
			`Contributions: GH_CONTRIBUTIONS_TOKEN is not set, using the snapshot generated at ${generatedAt}`
		)
		return years
	}

	const { years } = await fetchContributionYears(token)

	console.info(
		`Contributions: fetched from GitHub, ${years.map(({ year, total }) => `${year}: ${total}`).join(', ')}`
	)
	return addGitLabContributions(years, gitLabEvents.days)
}
