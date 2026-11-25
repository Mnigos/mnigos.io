import { afterEach, describe, expect, it, vi } from 'vitest'
import {
	fetchContributionYears,
	loadContributionYears,
	loadSnapshotContributionYears,
} from '../../contributions/infrastructure/contributions.client'
import { loadRecentWeekLevels } from './recent-contributions.query'

vi.mock('../../contributions/infrastructure/contributions.client', () => ({
	fetchContributionYears: vi.fn(),
	loadContributionYears: vi.fn(),
	loadSnapshotContributionYears: vi.fn(),
}))

type DailyCount = readonly [date: string, count: number]

function makeSnapshot(days: readonly DailyCount[]) {
	const countsByDate = new Map(days)

	const years = [2026, 2025, 2024, 2023].map(year => {
		const counts = Array.from(
			{ length: year === 2024 ? 366 : 365 },
			(_, index) =>
				countsByDate.get(
					new Date(Date.UTC(year, 0, index + 1)).toISOString().slice(0, 10)
				) ?? 0
		)

		return {
			year,
			total: counts.reduce((sum, count) => sum + count, 0),
			counts,
		}
	})

	return { generatedAt: '2026-11-25T00:00:00Z', years }
}

afterEach(() => {
	vi.resetAllMocks()
	vi.unstubAllEnvs()
	vi.unstubAllGlobals()
})

describe('loadRecentWeekLevels', () => {
	it('returns 26 empty levels when there is no contribution data', async () => {
		vi.mocked(loadSnapshotContributionYears).mockResolvedValue(makeSnapshot([]))

		expect(await loadRecentWeekLevels('2026-11-25')).toStrictEqual(
			Array.from({ length: 26 }, () => 0)
		)
		expect(loadSnapshotContributionYears).toHaveBeenCalledExactlyOnceWith()
	})

	it('reads only the snapshot when a GitHub token is set', async () => {
		vi.stubEnv('GH_CONTRIBUTIONS_TOKEN', 'test-token-123')
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockRejectedValue(new Error('Unexpected network request'))
		vi.stubGlobal('fetch', fetchMock)
		vi.mocked(loadContributionYears).mockRejectedValue(
			new Error('Unexpected live contribution load')
		)
		vi.mocked(fetchContributionYears).mockRejectedValue(
			new Error('Unexpected GitHub request')
		)
		vi.mocked(loadSnapshotContributionYears).mockResolvedValue(
			makeSnapshot([['2026-11-25', 601]])
		)

		expect(await loadRecentWeekLevels('2026-11-25')).toStrictEqual([
			...Array.from({ length: 25 }, () => 0),
			8,
		])
		expect(loadSnapshotContributionYears).toHaveBeenCalledExactlyOnceWith()
		expect(loadContributionYears).not.toHaveBeenCalled()
		expect(fetchContributionYears).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('orders weeks oldest first and includes exactly 182 days through today', async () => {
		vi.mocked(loadSnapshotContributionYears).mockResolvedValue(
			makeSnapshot([
				['2026-05-27', 1000],
				['2026-05-28', 8],
				['2026-06-03', 8],
				['2026-06-04', 46],
				['2026-11-18', 101],
				['2026-11-25', 1],
				['2026-11-26', 1000],
			])
		)

		expect(await loadRecentWeekLevels('2026-11-25')).toStrictEqual([
			2,
			3,
			...Array.from({ length: 22 }, () => 0),
			4,
			1,
		])
	})

	it.each([
		{ today: '2026-01-03', first: '2025-07-06', lastStart: '2025-12-28' },
		{ today: '2024-03-01', first: '2023-09-02', lastStart: '2024-02-24' },
	])(
		'keeps 26 weeks across a year boundary ending on $today',
		async ({ today, first, lastStart }) => {
			vi.mocked(loadSnapshotContributionYears).mockResolvedValue(
				makeSnapshot([
					[first, 1],
					[lastStart, 15],
					[today, 1],
				])
			)

			expect(await loadRecentWeekLevels(today)).toStrictEqual([
				1,
				...Array.from({ length: 24 }, () => 0),
				2,
			])
		}
	)

	it.each([
		[0, 0],
		[1, 1],
		[15, 1],
		[16, 2],
		[45, 2],
		[46, 3],
		[100, 3],
		[101, 4],
		[170, 4],
		[171, 5],
		[220, 5],
		[221, 5],
		[250, 5],
		[251, 6],
		[400, 6],
		[401, 7],
		[600, 7],
		[601, 8],
		[1_000_000, 8],
	])(
		'maps weekly total %i to level %i with the weekly thresholds',
		async (total, expected) => {
			const firstDay = Math.floor(total / 2)
			vi.mocked(loadSnapshotContributionYears).mockResolvedValue(
				makeSnapshot([
					['2026-11-24', firstDay],
					['2026-11-25', total - firstDay],
				])
			)

			expect(await loadRecentWeekLevels('2026-11-25')).toStrictEqual([
				...Array.from({ length: 25 }, () => 0),
				expected,
			])
		}
	)
})
