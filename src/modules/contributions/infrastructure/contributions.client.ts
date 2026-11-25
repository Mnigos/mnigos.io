import { GraphqlResponseError, graphql } from '@octokit/graphql'
import type { ContributionYear } from '../domain/contribution.types'
import { getDayOfYear, getDaysInYear } from '../domain/iso-date.helper'
import { env } from './contributions.config'

const FIRST_YEAR = 2021
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
		return `HTTP ${String(error.status)}`
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

/** One calendar year per request, from 2021 to the current year. */
export async function fetchContributionYears(token: string) {
	const years = Array.from(
		{ length: new Date().getUTCFullYear() - FIRST_YEAR + 1 },
		(_, index) => FIRST_YEAR + index
	)

	const request = graphql.defaults({
		headers: { authorization: `bearer ${token}` },
	})

	return await Promise.all(
		years.map(async year => await fetchContributionYear(year, request))
	)
}

/** Fetches from GitHub when `GH_CONTRIBUTIONS_TOKEN` is set, so a failing fetch fails the build; otherwise reads the committed snapshot. */
export async function loadContributionYears(): Promise<ContributionYear[]> {
	const token = env.GH_CONTRIBUTIONS_TOKEN

	if (!token) {
		const { default: snapshot } = await import('./contributions.snapshot.json')

		console.info(
			`Contributions: GH_CONTRIBUTIONS_TOKEN is not set, using the snapshot generated at ${snapshot.generatedAt}`
		)
		return snapshot.years
	}

	const years = await fetchContributionYears(token)

	console.info(
		`Contributions: fetched from GitHub, ${years.map(({ year, total }) => `${year}: ${total}`).join(', ')}`
	)
	return years
}
