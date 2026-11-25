import { describe, expect, it } from 'vitest'
import { addDays, getDayOfYear, getDaysInYear } from './iso-date.helper'

describe('addDays', () => {
	it.each([
		['2025-01-01', 0, '2025-01-01'],
		['2025-01-31', 1, '2025-02-01'],
		['2024-02-28', 1, '2024-02-29'],
		['2024-02-29', 1, '2024-03-01'],
		['2025-03-01', -1, '2025-02-28'],
		['2025-01-01', -1, '2024-12-31'],
		['2024-12-31', 1, '2025-01-01'],
		['2025-03-29', 2, '2025-03-31'],
		['2025-10-25', 2, '2025-10-27'],
	])('adds %s by %i days to get %s', (date, days, expected) => {
		expect(addDays(date, days)).toBe(expected)
	})
})

describe('getDayOfYear', () => {
	it.each([
		['2025-01-01', 0],
		['2024-02-29', 59],
		['2024-03-01', 60],
		['2025-03-01', 59],
		['2024-12-31', 365],
		['2025-12-31', 364],
	])('indexes %s at %i from Jan 1', (date, expected) => {
		expect(getDayOfYear(date)).toBe(expected)
	})
})

describe('getDaysInYear', () => {
	it.each([
		[2023, 365],
		[2024, 366],
		[2000, 366],
		[2100, 365],
	])('counts %i as %i days', (year, expected) => {
		expect(getDaysInYear(year)).toBe(expected)
	})
})
