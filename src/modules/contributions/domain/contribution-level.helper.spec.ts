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
		[150, 5],
		[151, 6],
		[250, 6],
		[251, 7],
		[350, 7],
		[351, 8],
		[1_000_000, 8],
	])('maps daily count %i to level %i', (count, expected) => {
		expect(getContributionLevel(count)).toBe(expected)
	})

	it.each([
		[0, 0],
		[1, 0],
		[2, 1],
		[9, 1],
		[10, 2],
		[19, 2],
		[20, 3],
		[39, 3],
		[40, 4],
		[79, 4],
		[80, 5],
		[159, 5],
		[160, 6],
		[319, 6],
		[320, 7],
		[639, 7],
		[640, 8],
		[1_000_000, 8],
	])('maps custom count %i to level %i', (count, expected) => {
		expect(
			getContributionLevel(count, [2, 10, 20, 40, 80, 160, 320, 640])
		).toBe(expected)
	})
})
