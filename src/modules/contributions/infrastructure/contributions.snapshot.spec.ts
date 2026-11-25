import { describe, expect, it } from 'vitest'
import { getDaysInYear } from '../domain/iso-date.helper'
import snapshot from './contributions.snapshot.json'

describe('contributions snapshot', () => {
	it('contains every year from 2021 through its generation year exactly once', () => {
		const lastYear = new Date(snapshot.generatedAt).getUTCFullYear()

		expect(snapshot.years.map(({ year }) => year)).toEqual(
			Array.from({ length: lastYear - 2020 }, (_, index) => 2021 + index)
		)
	})

	it('records a valid UTC generation timestamp', () => {
		expect(new Date(snapshot.generatedAt).toISOString()).toBe(
			snapshot.generatedAt
		)
	})

	it.each(snapshot.years)(
		'stores a full calendar and a matching total for $year',
		({ year, total, counts }) => {
			expect(counts).toHaveLength(getDaysInYear(year))
			expect(counts.every(count => Number.isInteger(count) && count >= 0)).toBe(
				true
			)
			expect(counts.reduce((sum, count) => sum + count, 0)).toBe(total)
		}
	)
})
