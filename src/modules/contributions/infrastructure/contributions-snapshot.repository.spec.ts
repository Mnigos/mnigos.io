import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CommitDays } from '../domain/contribution.types'
import {
	writeCommitDaysSnapshot,
	writeContributionSnapshot,
} from './contributions-snapshot.repository'
import snapshot from './contributions.snapshot.json'
import commitSnapshot from './rigtch-fm-commits.snapshot.json'

interface CommitDaysChange {
	name: string
	days: CommitDays
}

const now = new Date('2026-11-26T04:17:00.000Z')
let directory: string

beforeEach(async () => {
	directory = await mkdtemp(join(tmpdir(), 'MNG-12-contributions-'))
})

afterEach(async () => {
	await rm(directory, { recursive: true, force: true })
})

describe('writeContributionSnapshot', () => {
	it('keeps the committed snapshot byte-identical, including generatedAt, when years are unchanged', async () => {
		const original = await readFile(
			new URL('contributions.snapshot.json', import.meta.url)
		)
		const path = join(directory, 'contributions.snapshot.json')
		await writeFile(path, original)

		expect(await writeContributionSnapshot(path, snapshot.years, now)).toBe(
			false
		)
		expect(await readFile(path)).toEqual(original)
	})

	it.each([undefined, 2])(
		'preserves unchanged years and all bytes with JSON indentation %s',
		async indentation => {
			const original = JSON.stringify(snapshot, null, indentation)
			const path = join(directory, 'contributions.snapshot.json')
			await writeFile(path, original)

			expect(await writeContributionSnapshot(path, snapshot.years, now)).toBe(
				false
			)
			expect(await readFile(path, 'utf-8')).toBe(original)
		}
	)

	it.each([
		{
			name: 'a daily count with its total',
			years: snapshot.years.map((year, index) =>
				index === 0
					? {
							...year,
							total: year.total + 1,
							counts: year.counts.map((count, day) =>
								day === 0 ? count + 1 : count
							),
						}
					: year
			),
		},
		{
			name: 'only the API total',
			years: snapshot.years.map((year, index) =>
				index === 0 ? { ...year, total: year.total + 1 } : year
			),
		},
		{ name: 'the set of years', years: snapshot.years.slice(1) },
	])(
		'rewrites the timestamp and round-trips a change to $name',
		async ({ years }) => {
			const original = await readFile(
				new URL('contributions.snapshot.json', import.meta.url)
			)
			const path = join(directory, 'contributions.snapshot.json')
			await writeFile(path, original)

			expect(await writeContributionSnapshot(path, years, now)).toBe(true)
			const written = await readFile(path, 'utf-8')
			expect(JSON.parse(written)).toEqual({
				generatedAt: now.toISOString(),
				years,
			})
			expect(written.split('\n')).toEqual([
				'{',
				`  "generatedAt": "${now.toISOString()}",`,
				'  "years": [',
				...years.map(
					(year, index) =>
						`    ${JSON.stringify(year)}${index === years.length - 1 ? '' : ','}`
				),
				'  ]',
				'}',
				'',
			])
			expect(
				await writeContributionSnapshot(
					path,
					years,
					new Date('2026-11-27T04:17:00.000Z')
				)
			).toBe(false)
			expect(await readFile(path, 'utf-8')).toBe(written)
		}
	)
})

describe('writeCommitDaysSnapshot', () => {
	it('keeps the committed snapshot byte-identical, including generatedAt, when days are unchanged', async () => {
		const original = await readFile(
			new URL('rigtch-fm-commits.snapshot.json', import.meta.url)
		)
		const path = join(directory, 'rigtch-fm-commits.snapshot.json')
		await writeFile(path, original)

		expect(await writeCommitDaysSnapshot(path, commitSnapshot.days, now)).toBe(
			false
		)
		expect(await readFile(path)).toEqual(original)
	})

	it.each([undefined, 2])(
		'preserves unchanged days and all bytes with JSON indentation %s',
		async indentation => {
			const original = JSON.stringify(
				{
					generatedAt: '2025-01-01T00:00:00.000Z',
					days: { '2025-01-01': 3, '2025-01-02': 5 },
				},
				null,
				indentation
			)
			const path = join(directory, 'days.snapshot.json')
			await writeFile(path, original)

			expect(
				await writeCommitDaysSnapshot(
					path,
					{ '2025-01-02': 5, '2025-01-01': 3 },
					now
				)
			).toBe(false)
			expect(await readFile(path, 'utf-8')).toBe(original)
		}
	)

	it.each<CommitDaysChange>([
		{ name: 'a count', days: { '2025-01-01': 4 } },
		{ name: 'an added date', days: { '2025-01-01': 3, '2025-01-02': 5 } },
		{ name: 'a removed date', days: {} },
	])(
		'rewrites the timestamp and round-trips a change to $name',
		async ({ days }) => {
			const path = join(directory, 'days.snapshot.json')
			await writeFile(
				path,
				JSON.stringify({
					generatedAt: '2025-01-01T00:00:00.000Z',
					days: { '2025-01-01': 3 },
				})
			)

			expect(await writeCommitDaysSnapshot(path, days, now)).toBe(true)
			const written = await readFile(path, 'utf-8')
			expect(JSON.parse(written)).toEqual({
				generatedAt: now.toISOString(),
				days,
			})
			expect(
				await writeCommitDaysSnapshot(
					path,
					days,
					new Date('2026-11-27T04:17:00.000Z')
				)
			).toBe(false)
			expect(await readFile(path, 'utf-8')).toBe(written)
		}
	)
})
