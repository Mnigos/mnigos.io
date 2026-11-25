import { describe, expect, it } from 'vitest'
import { getContributionLevel } from './contribution-level.helper'
import {
	RIGTCH_FM_FIRST_WEEK,
	RIGTCH_FM_WEEKLY_THRESHOLDS,
} from './rigtch-fm-commits.constants'

describe('RIGTCH_FM_FIRST_WEEK', () => {
	it('starts the strip on the first archived commit date', () => {
		expect(RIGTCH_FM_FIRST_WEEK).toBe('2022-11-01')
	})
})

describe('RIGTCH_FM_WEEKLY_THRESHOLDS', () => {
	it.each([
		[0, 0],
		[1, 1],
		[4, 1],
		[5, 2],
		[9, 2],
		[10, 3],
		[19, 3],
		[20, 4],
		[34, 4],
		[35, 5],
		[59, 5],
		[60, 6],
		[99, 6],
		[100, 7],
		[149, 7],
		[150, 8],
		[344, 8],
	])('maps weekly total %i to level %i', (total, expected) => {
		expect(getContributionLevel(total, RIGTCH_FM_WEEKLY_THRESHOLDS)).toBe(
			expected
		)
	})
})
