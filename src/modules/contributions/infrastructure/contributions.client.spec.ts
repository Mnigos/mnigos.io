import { inspect } from 'node:util'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchContributionYears } from './contributions.client'
import snapshot from './contributions.snapshot.json'

const token = 'test-token-123'

function calendarResponse(year: number) {
	return {
		data: {
			viewer: {
				contributionsCollection: {
					contributionCalendar: {
						totalContributions: year * 10,
						weeks: [
							{
								contributionDays: [
									{ date: `${year - 1}-12-31`, contributionCount: 999 },
									{ date: `${year}-01-01`, contributionCount: 4 },
									...(year === 2024
										? [{ date: '2024-02-29', contributionCount: 13 }]
										: []),
									{ date: `${year}-03-01`, contributionCount: 9 },
									{ date: `${year}-12-31`, contributionCount: 31 },
									{ date: `${year + 1}-01-01`, contributionCount: 999 },
								],
							},
						],
					},
				},
			},
		},
	}
}

interface RequestBody {
	query: string
	variables: { from: string; to: string }
}

function readRequestBody(init: RequestInit | undefined) {
	if (typeof init?.body !== 'string') throw new Error('Expected a JSON body')
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the client under test writes this body
	return JSON.parse(init.body) as RequestBody
}

function stubCalendars() {
	const fetchMock = vi
		.fn<typeof fetch>()
		.mockImplementation(async (_url, init) => {
			const { variables } = readRequestBody(init)
			return Response.json(calendarResponse(Number(variables.from.slice(0, 4))))
		})
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

async function loadClientWithToken(value: string | undefined) {
	vi.resetModules()
	vi.stubEnv('GH_CONTRIBUTIONS_TOKEN', value)
	const client = await import('./contributions.client')
	const { env } = await import('./contributions.config')
	expect(env.GH_CONTRIBUTIONS_TOKEN).toBe(value || undefined)
	return client
}

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-01-01T00:30:00Z'))
	vi.stubEnv('GH_CONTRIBUTIONS_TOKEN', '')
	vi.stubEnv('GITHUB_TOKEN', '')
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'debug').mockImplementation(() => {})
})

afterEach(() => {
	try {
		for (const method of ['info', 'log', 'warn', 'error', 'debug'] as const)
			expect(
				JSON.stringify(vi.mocked(console[method]).mock.calls)
			).not.toContain(token)
	} finally {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		vi.unstubAllEnvs()
		vi.useRealTimers()
	}
})

describe('fetchContributionYears', () => {
	it.each([
		{ year: 2024, days: 366, march1: 60 },
		{ year: 2025, days: 365, march1: 59 },
	])(
		'normalises $year to $days dates and preserves the API total',
		async ({ year, days, march1 }) => {
			stubCalendars()
			const years = await fetchContributionYears(token)
			const counts = Array.from({ length: days }, () => 0)
			counts[0] = 4
			if (year === 2024) counts[59] = 13
			counts[march1] = 9
			counts[days - 1] = 31

			expect(years.find(value => value.year === year)).toEqual({
				year,
				total: year * 10,
				counts,
			})
			expect(JSON.stringify(years)).not.toContain(token)
		}
	)

	it('requests every UTC year from 2021 through the current year with the token only in authorization', async () => {
		const fetchMock = stubCalendars()
		const years = await fetchContributionYears(token)

		expect(years.map(({ year }) => year)).toEqual([
			2021, 2022, 2023, 2024, 2025, 2026,
		])
		expect(fetchMock).toHaveBeenCalledTimes(6)
		for (const [index, [url, init]] of fetchMock.mock.calls.entries()) {
			const year = 2021 + index
			const headers = new Headers(init?.headers)
			expect(url).toBe('https://api.github.com/graphql')
			expect(init?.method).toBe('POST')
			expect(headers.get('authorization')).toBe(`bearer ${token}`)
			headers.delete('authorization')
			expect(headers.get('content-type')).toMatch(/^application\/json/u)
			expect(JSON.stringify([...headers])).not.toContain(token)
			expect(
				JSON.stringify({ ...init, headers: Object.fromEntries(headers), url })
			).not.toContain(token)
			const body = readRequestBody(init)
			expect(body.variables).toEqual({
				from: `${year}-01-01T00:00:00Z`,
				to: `${year}-12-31T23:59:59Z`,
			})
			expect(body.query).toContain('viewer')
			expect(body.query).toContain('totalContributions')
			expect(body.query).toContain('contributionDays')
		}
	})

	it.each([401, 403, 500])(
		'throws HTTP %i without exposing the response body or token',
		async status => {
			vi.stubGlobal(
				'fetch',
				vi
					.fn<typeof fetch>()
					.mockImplementation(async () => new Response(token, { status }))
			)

			const failure = await fetchContributionYears(token).catch(
				(error: unknown) => error
			)
			expect(failure).toBeInstanceOf(Error)
			expect(String(failure)).toContain(`HTTP ${status}`)
			expect(String(failure)).not.toContain(token)
		}
	)

	it('throws all GraphQL error messages without exposing the token', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn<typeof fetch>().mockImplementation(async () =>
				Response.json({
					errors: [{ message: 'First failure' }, { message: 'Second failure' }],
				})
			)
		)
		const failure = await fetchContributionYears(token).catch(
			(error: unknown) => error
		)

		expect(failure).toBeInstanceOf(Error)
		expect(String(failure)).toContain('First failure')
		expect(String(failure)).toContain('Second failure')
		expect(String(failure)).not.toContain(token)
	})

	it('throws when a successful response has no calendar', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn<typeof fetch>()
				.mockImplementation(async () => Response.json({ data: null }))
		)

		await expect(fetchContributionYears(token)).rejects.toThrow(
			'no calendar in the response'
		)
	})

	it('throws GraphQL errors that come with partial data', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn<typeof fetch>().mockImplementation(async () =>
				Response.json({
					...calendarResponse(2021),
					errors: [{ message: 'Partial calendar failure' }],
				})
			)
		)

		await expect(fetchContributionYears(token)).rejects.toThrow(
			'Partial calendar failure'
		)
	})
})

describe('loadContributionYears', () => {
	it.each([undefined, ''])(
		'reads the snapshot and logs one line when the token is %s',
		async value => {
			vi.stubEnv('GITHUB_TOKEN', token)
			const { loadContributionYears } = await loadClientWithToken(value)
			const fetchMock = vi
				.fn<typeof fetch>()
				.mockRejectedValue(new Error('Unexpected network request'))
			vi.stubGlobal('fetch', fetchMock)

			expect(await loadContributionYears()).toEqual(snapshot.years)
			expect(fetchMock).not.toHaveBeenCalled()
			expect(console.info).toHaveBeenCalledTimes(1)
			const [line] = vi.mocked(console.info).mock.calls
			expect(line).toHaveLength(1)
			expect(String(line?.[0])).toMatch(/snapshot/iu)
			expect(String(line?.[0])).toContain(snapshot.generatedAt)
		}
	)

	it('fetches with the token and logs all fetched year totals in one line', async () => {
		const { loadContributionYears } = await loadClientWithToken(token)
		const fetchMock = stubCalendars()
		const years = await loadContributionYears()

		expect(fetchMock).toHaveBeenCalledTimes(6)
		expect(years.map(({ year, total }) => ({ year, total }))).toEqual(
			[2021, 2022, 2023, 2024, 2025, 2026].map(year => ({
				year,
				total: year * 10,
			}))
		)
		expect(console.info).toHaveBeenCalledTimes(1)
		const [line] = vi.mocked(console.info).mock.calls
		expect(line).toHaveLength(1)
		expect(String(line?.[0])).toMatch(/fetched/iu)
		for (const { year, total } of years)
			expect(String(line?.[0])).toContain(`${year}: ${total}`)
		expect(JSON.stringify(years)).not.toContain(token)
	})

	it('throws a failed token fetch without logging snapshot success', async () => {
		const { loadContributionYears } = await loadClientWithToken(token)
		vi.stubGlobal(
			'fetch',
			vi
				.fn<typeof fetch>()
				.mockImplementation(async () => new Response(token, { status: 401 }))
		)

		const result = loadContributionYears()
		await expect(result).rejects.toThrow('HTTP 401')
		await expect(result).rejects.not.toThrow(token)
		expect(console.info).not.toHaveBeenCalled()
	})

	it('keeps the Octokit error as the cause with the token redacted', async () => {
		const { loadContributionYears } = await loadClientWithToken(token)
		vi.stubGlobal(
			'fetch',
			vi
				.fn<typeof fetch>()
				.mockImplementation(
					async () => new Response('Server Error', { status: 500 })
				)
		)

		const failure = await loadContributionYears().catch(
			(error: unknown) => error
		)
		expect(failure).toBeInstanceOf(Error)
		expect(String(failure)).toBe('Error: GitHub contributions 2021: HTTP 500')
		expect(failure).toHaveProperty('cause.status', 500)
		expect(inspect(failure, { depth: Infinity })).not.toContain(token)
		expect(console.info).not.toHaveBeenCalled()
	})
})
