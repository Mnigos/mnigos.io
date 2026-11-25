import { describe, expect, test } from 'vitest'
import { formatFactValue, formatMonth } from './profile-format.helper'

describe('formatFactValue', () => {
	test.each([
		[0, '0'],
		[43, '43'],
		[5400, '5,400'],
		[73_000, '73,000'],
		[999_999, '999,999'],
		[1_000_000, '1M'],
		[362_000_000, '362M'],
	] as const)('formats %i as %s', (value, expected) => {
		expect(formatFactValue(value)).toBe(expected)
	})
})

describe('formatMonth', () => {
	test.each([
		['2026-03', '03.2026'],
		['2021-08', '08.2021'],
	])('formats %s as %s', (month, expected) => {
		expect(formatMonth(month)).toBe(expected)
	})
})
