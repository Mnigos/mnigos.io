import { describe, expect, it } from 'vitest'
import {
	formatIsoDate,
	formatPostDate,
	getPostNeighbours,
	getReadingMinutes,
	sortNewestFirst,
} from './post.helper'

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

describe('formatIsoDate', () => {
	it.each([
		['2026-01-05T00:00:00Z', '2026-01-05'],
		['2026-01-05T00:30:00+02:00', '2026-01-04'],
		['2026-12-31T23:30:00-02:00', '2027-01-01'],
		['2024-02-29T23:59:59Z', '2024-02-29'],
	])('formats %s as the UTC calendar day %s', (date, expected) => {
		expect(formatIsoDate(new Date(date))).toBe(expected)
	})
})

describe('getReadingMinutes', () => {
	it.each(['', ' ', '\n\t  \r\n'])('gives one minute for %j', body => {
		expect(getReadingMinutes(body)).toBe(1)
	})

	it.each([
		[1, 1],
		[220, 1],
		[221, 2],
		[440, 2],
		[441, 3],
	])('rounds %i words up to %i minutes', (words, expected) => {
		const body = Array.from({ length: words }, () => 'word').join(' ')

		expect(getReadingMinutes(body)).toBe(expected)
	})

	it.each(['\n', '\t', '\r\n', ' \n\t '])(
		'counts words separated by %j',
		separator => {
			const body = Array.from({ length: 221 }, () => 'word').join(separator)

			expect(getReadingMinutes(`\n\t${body}  `)).toBe(2)
		}
	)
})

describe('getPostNeighbours', () => {
	const newest = { id: 'newest' }
	const middle = { id: 'middle' }
	const oldest = { id: 'oldest' }
	const posts = [newest, middle, oldest]

	it.each([
		['newest', middle, undefined],
		['middle', oldest, newest],
		['oldest', undefined, middle],
		['unknown', undefined, undefined],
	] as const)(
		'finds the older previous and newer next post for %s',
		(id, previous, next) => {
			const result = getPostNeighbours(posts, id)

			expect(result).toStrictEqual({ previous, next })
			expect(result.previous).toBe(previous)
			expect(result.next).toBe(next)
		}
	)

	it('has no neighbours for a single post', () => {
		expect(getPostNeighbours([newest], newest.id)).toStrictEqual({
			previous: undefined,
			next: undefined,
		})
	})

	it('has no neighbours in an empty collection', () => {
		expect(getPostNeighbours([], newest.id)).toStrictEqual({
			previous: undefined,
			next: undefined,
		})
	})

	it('does not mutate the input order or posts', () => {
		const frozen = Object.freeze(posts.map(post => Object.freeze({ ...post })))

		expect(getPostNeighbours(frozen, middle.id)).toStrictEqual({
			previous: frozen[2],
			next: frozen[0],
		})
		expect(frozen).toStrictEqual([newest, middle, oldest])
	})
})
