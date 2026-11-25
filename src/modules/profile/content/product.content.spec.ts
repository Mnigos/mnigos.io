import { assert, describe, expect, test } from 'vitest'
import { OLD_WEB_STACK_UNTIL, PRODUCT } from './product.content'
import { PROFILE } from './profile.content'

interface PostFrontmatter {
	tags?: string[]
	draft?: boolean
}

const posts = import.meta.glob<PostFrontmatter>(
	'../../../content/blog/*.{md,mdx}',
	{ eager: true, import: 'frontmatter' }
)

describe('PRODUCT', () => {
	test('keeps the product exposed through PROFILE', () => {
		expect(PROFILE.product).toStrictEqual(PRODUCT)
	})

	test('keeps the approved commit strip legend', () => {
		expect(PROFILE.product.commitStripLegend).toBe(
			'One square is one week of my git commits to rigtch.fm since November 2022.'
		)
	})

	test('keeps the four product page facts in their display order', () => {
		expect(
			PROFILE.product.pageFacts.map(({ value, label }) => ({ value, label }))
		).toStrictEqual([
			{ value: 73_000, label: 'listeners' },
			{ value: 362_000_000, label: 'plays stored' },
			{ value: '2024-03', label: 'every play saved since' },
			{ value: '2026-03', label: 'paid plan live' },
		])
	})

	test('sources and dates the new every-play fact', () => {
		expect(PROFILE.product.pageFacts[2]).toStrictEqual({
			value: '2024-03',
			label: 'every play saved since',
			source:
				"Igor's post src/content/blog/why-rigtch-fm-stores-every-play.mdx",
			checkedOn: '2026-11-25',
		})
	})

	test('keeps the history months and titles in chronological order', () => {
		expect(
			PROFILE.product.history.map(({ month, title }) => ({
				month: month.value,
				title,
			}))
		).toStrictEqual([
			{ month: '2022-11', title: 'First version.' },
			{ month: '2024-03', title: 'Every play saved.' },
			{ month: '2026-02', title: 'New platform.' },
			{ month: '2026-03', title: 'Paid plan live.' },
		])
	})

	test('sources and dates every history month', () => {
		expect(
			PROFILE.product.history.map(({ month }) => ({
				source: month.source,
				checkedOn: month.checkedOn,
			}))
		).toStrictEqual([
			{
				source:
					"Igor's post src/content/blog/why-rigtch-fm-stores-every-play.mdx",
				checkedOn: '2026-11-25',
			},
			{
				source:
					"Igor's post src/content/blog/why-rigtch-fm-stores-every-play.mdx",
				checkedOn: '2026-11-25',
			},
			{
				source: 'rigtch.fm repository history',
				checkedOn: '2026-11-25',
			},
			{
				source: 'rigtch.fm billing records',
				checkedOn: '2026-11-25',
			},
		])
	})

	test('reuses the same fact objects across the strips and history', () => {
		expect(PRODUCT.pageFacts[0]).toBe(PRODUCT.facts[0])
		expect(PRODUCT.pageFacts[1]).toBe(PRODUCT.facts[1])
		expect(PRODUCT.pageFacts[3]).toBe(PRODUCT.facts[2])
		expect(PRODUCT.history[1].month).toBe(PRODUCT.pageFacts[2])
		expect(PRODUCT.history[2].month).toBe(OLD_WEB_STACK_UNTIL)
		expect(PRODUCT.history[3].month).toBe(PRODUCT.facts[2])
	})

	test('links only the every-play history entry to the source post', () => {
		expect(PROFILE.product.history.map(({ postId }) => postId)).toStrictEqual([
			undefined,
			'why-rigtch-fm-stores-every-play',
			undefined,
			undefined,
		])
	})

	test('keeps the referenced history post present, published and tagged rigtch', () => {
		const [, { postId }] = PROFILE.product.history
		const post = posts[`../../../content/blog/${postId}.mdx`]

		assert(post !== undefined)
		expect(post.tags).toContain('rigtch')
		expect(post.draft ?? false).toBe(false)
	})
})
