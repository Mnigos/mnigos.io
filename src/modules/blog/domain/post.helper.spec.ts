import { describe, expect, it } from 'vitest'
import { formatPostDate, sortNewestFirst } from './post.helper'

describe('sortNewestFirst', () => {
	const oldest = { id: 'oldest', data: { publishedAt: new Date('2025-12-31') } }
	const middle = { id: 'middle', data: { publishedAt: new Date('2026-01-05') } }
	const newest = { id: 'newest', data: { publishedAt: new Date('2026-11-25') } }

	it('orders posts by publication time, newest first', () => {
		expect(sortNewestFirst([middle, oldest, newest])).toStrictEqual([
			newest,
			middle,
			oldest,
		])
	})

	it('returns a new array without mutating the input or cloning posts', () => {
		const posts = Object.freeze([oldest, newest, middle])
		const result = sortNewestFirst(posts)

		expect(result).not.toBe(posts)
		expect(posts).toStrictEqual([oldest, newest, middle])
		expect(result[0]).toBe(newest)
		expect(result[1]).toBe(middle)
		expect(result[2]).toBe(oldest)
	})

	it('keeps input order when publication times are equal', () => {
		const sameDate = {
			id: 'same-date',
			data: { publishedAt: new Date('2026-01-05') },
		}

		expect(sortNewestFirst([middle, oldest, sameDate])).toStrictEqual([
			middle,
			sameDate,
			oldest,
		])
	})

	it('returns a new empty array for empty input', () => {
		const posts = Object.freeze([])
		const result = sortNewestFirst(posts)

		expect(result).toStrictEqual([])
		expect(result).not.toBe(posts)
	})
})

describe('formatPostDate', () => {
	it.each([
		['long', 'January 5, 2026'],
		['short', 'Jan 5, 2026'],
	] as const)('formats an en-US date with a %s month', (month, expected) => {
		expect(formatPostDate(new Date(2026, 0, 5, 12), month)).toBe(expected)
	})

	it('keeps a local-midnight post on its day in the build time zone', () => {
		const date = new Date(2026, 0, 5)

		expect(formatPostDate(date, 'long')).toBe('January 5, 2026')
		expect(formatPostDate(date, 'short')).toBe('Jan 5, 2026')
	})
})
