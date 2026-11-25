import { inspect } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { CommitDays } from '../domain/contribution.types'
import archive from './rigtch-fm-archive-commits.snapshot.json'
import {
	fetchRigtchFmCommitDays,
	loadRigtchFmCommitYears,
	RigtchFmResponseError,
} from './rigtch-fm-commits.client'
import monorepo from './rigtch-fm-commits.snapshot.json'

const token = 'test-rigtch-token'
const commitsUrl =
	'https://api.github.com/repos/Rigtch/rigtch.fm/commits?author=Mnigos&per_page=100'

function commit(date: string) {
	return {
		commit: { author: { date }, committer: { date: '2000-01-01T00:00:00Z' } },
	}
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('fetchRigtchFmCommitDays', () => {
	it('follows next links across three pages and counts author dates in UTC', async () => {
		const page2 = `${commitsUrl}&page=2`
		const page3 = `${commitsUrl}&page=3`
		const request = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				Response.json(
					[commit('2025-03-01T00:30:00+02:00'), commit('2025-02-28T23:00:00Z')],
					{
						headers: { link: `<${page3}>; rel="last", <${page2}>; rel="next"` },
					}
				)
			)
			.mockResolvedValueOnce(
				Response.json(
					[
						commit('2024-12-31T23:30:00-02:00'),
						commit('2025-03-01T23:30:00-02:00'),
					],
					{
						headers: {
							link: `<${commitsUrl}>; rel="prev", <${page3}>; rel="next"`,
						},
					}
				)
			)
			.mockResolvedValueOnce(
				Response.json([commit('2025-02-28T01:00:00Z')], {
					headers: {
						link: `<${page2}>; rel="prev", <${commitsUrl}>; rel="first"`,
					},
				})
			)

		expect(await fetchRigtchFmCommitDays(token, request)).toEqual({
			days: { '2025-01-01': 1, '2025-02-28': 3, '2025-03-02': 1 },
			tokenExpiration: undefined,
		})
		expect(request.mock.calls.map(([url]) => url)).toEqual([
			commitsUrl,
			page2,
			page3,
		])
		for (const [, init] of request.mock.calls) {
			expect(init?.method ?? 'GET').toBe('GET')
			expect(Object.fromEntries(new Headers(init?.headers))).toEqual({
				accept: 'application/vnd.github+json',
				authorization: `Bearer ${token}`,
				'x-github-api-version': '2022-11-28',
			})
		}
	})

	it.each([undefined, '2026-12-25 00:00:00 UTC'])(
		'returns only the first page expiration header %s',
		async expiration => {
			const request = vi
				.fn<typeof fetch>()
				.mockResolvedValueOnce(
					Response.json([commit('2025-01-01T00:00:00Z')], {
						headers: {
							link: `<${commitsUrl}&page=2>; rel="next"`,
							...(expiration === undefined
								? {}
								: { 'github-authentication-token-expiration': expiration }),
						},
					})
				)
				.mockResolvedValueOnce(
					Response.json([], {
						headers: {
							'github-authentication-token-expiration':
								'2027-01-01 00:00:00 UTC',
						},
					})
				)

			expect(await fetchRigtchFmCommitDays(token, request)).toEqual({
				days: { '2025-01-01': 1 },
				tokenExpiration: expiration,
			})
			expect(request).toHaveBeenCalledTimes(2)
		}
	)

	it('returns no days or expiration for an empty list', async () => {
		const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json([]))

		expect(await fetchRigtchFmCommitDays(token, request)).toEqual({
			days: {},
			tokenExpiration: undefined,
		})
		expect(request).toHaveBeenCalledTimes(1)
	})

	it.each([401, 403, 404, 500])(
		'throws only HTTP %i without reading the response body',
		async status => {
			const body = `private response ${token}`
			const response = new Response(body, { status })
			const json = vi.spyOn(response, 'json')
			const text = vi.spyOn(response, 'text')
			const request = vi.fn<typeof fetch>().mockResolvedValue(response)
			const failure = await fetchRigtchFmCommitDays(token, request).catch(
				(error: unknown) => error
			)

			expect(failure).toBeInstanceOf(RigtchFmResponseError)
			expect(failure).toHaveProperty('message', `HTTP ${status}`)
			expect(inspect(failure, { depth: Infinity })).not.toContain(body)
			expect(inspect(failure, { depth: Infinity })).not.toContain(token)
			expect(json).not.toHaveBeenCalled()
			expect(text).not.toHaveBeenCalled()
			expect(response.bodyUsed).toBe(false)
			expect(request).toHaveBeenCalledTimes(1)
		}
	)

	it('rejects an error on a later page without reading its body', async () => {
		const first = Response.json([commit('2025-01-01T00:00:00Z')], {
			headers: { link: `<${commitsUrl}&page=2>; rel="next"` },
		})
		const rejected = new Response('private response', { status: 403 })
		const request = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(first)
			.mockResolvedValueOnce(rejected)

		await expect(fetchRigtchFmCommitDays(token, request)).rejects.toThrow(
			RigtchFmResponseError
		)
		expect(rejected.bodyUsed).toBe(false)
	})

	it.each([
		{ name: 'a non-array page', page: { message: 'unexpected' } },
		{ name: 'a missing author', page: [{ commit: {} }] },
		{ name: 'a null author', page: [{ commit: { author: null } }] },
		{ name: 'an invalid timestamp', page: [commit('not-a-date')] },
	])('rejects $name with a schema error', async ({ page }) => {
		const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(page))

		await expect(fetchRigtchFmCommitDays(token, request)).rejects.toThrow(
			ZodError
		)
	})
})

describe('loadRigtchFmCommitYears', () => {
	it('adds both snapshots on every date without fetching', () => {
		const request = vi
			.fn<typeof fetch>()
			.mockRejectedValue(new Error('Unexpected network request'))
		vi.stubGlobal('fetch', request)
		const years = loadRigtchFmCommitYears()
		const sources: readonly CommitDays[] = [archive.days, monorepo.days]
		const expectedYears = [
			...new Set(
				sources.flatMap(days =>
					Object.keys(days).map(date => Number(date.slice(0, 4)))
				)
			),
		].toSorted((first, second) => first - second)

		expect(years.map(({ year }) => year)).toEqual(expectedYears)
		for (const { year, counts, total } of years) {
			const length =
				(Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000
			const expected = Array.from({ length }, (_, index) => {
				const date = new Date(Date.UTC(year, 0, index + 1))
					.toISOString()
					.slice(0, 10)

				return sources.reduce((sum, days) => sum + (days[date] ?? 0), 0)
			})
			expect(counts).toEqual(expected)
			expect(total).toBe(expected.reduce((sum, count) => sum + count, 0))
		}
		expect(request).not.toHaveBeenCalled()
	})
})
