import { describe, expect, it } from 'vitest'
import { getContributionLevel } from './contribution-level.helper'

describe('getContributionLevel', () => {
	it.each([
		[0, 0],
		[1, 1],
		[4, 1],
		[5, 2],
		[12, 2],
		[13, 3],
		[30, 3],
		[31, 4],
		[80, 4],
		[81, 5],
		[1_000_000, 5],
	])('maps daily count %i to level %i', (count, expected) => {
		expect(getContributionLevel(count)).toBe(expected)
	})

	it.each([
		[0, 0],
		[1, 1],
		[15, 1],
		[16, 2],
		[45, 2],
		[46, 3],
		[100, 3],
		[101, 4],
		[220, 4],
		[221, 5],
		[1_000_000, 5],
	])('maps weekly count %i to level %i', (count, expected) => {
		expect(getContributionLevel(count, [1, 16, 46, 101, 221])).toBe(expected)
	})
})
