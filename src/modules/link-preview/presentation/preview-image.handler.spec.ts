import type { CollectionEntry } from 'astro:content'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BLOG_PAGE } from '../../blog/content/blog-page.content'
import { getPublishedPosts } from '../../blog/infrastructure/posts.query'
import { PROFILE } from '../../profile/content/profile.content'
import { RIGTCH_PAGE } from '../../rigtch/content/rigtch-page.content'
import { HOME_PAGE } from '../../site/content/home-page.content'
import { WORK_PAGE } from '../../work/content/work-page.content'
import { loadRecentWeekLevels } from '../infrastructure/recent-contributions.query'
import { getStaticPaths } from './preview-image.handler'

vi.mock('../../blog/infrastructure/posts.query', () => ({
	getPublishedPosts: vi.fn(),
}))

vi.mock('../infrastructure/recent-contributions.query', () => ({
	loadRecentWeekLevels: vi.fn(),
}))

const RECENT_WEEKS = Array.from({ length: 26 }, (_, index) => index % 6)

interface PostFixtureOptions {
	description?: string
	publishedAt?: Date
	tags?: string[]
	body?: string
}

function makePost(
	id: string,
	title: string,
	options: PostFixtureOptions = {}
): CollectionEntry<'blog'> {
	return {
		id,
		collection: 'blog',
		body: options.body,
		data: {
			title,
			description: options.description ?? 'Fixture post description.',
			publishedAt: options.publishedAt ?? new Date('2026-11-25'),
			tags: options.tags ?? [],
			draft: false,
		},
	}
}

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date('2026-11-25T00:30:00Z'))
	vi.mocked(loadRecentWeekLevels).mockResolvedValue(RECENT_WEEKS)
})

afterEach(() => {
	vi.resetAllMocks()
	vi.useRealTimers()
})

describe('preview image getStaticPaths', () => {
	it('generates the four page images when there are no published posts', async () => {
		vi.mocked(getPublishedPosts).mockResolvedValue([])

		expect(await getStaticPaths()).toStrictEqual([
			{
				params: { slug: 'home' },
				props: {
					path: '/',
					title: PROFILE.name,
					description: HOME_PAGE.description,
					recentWeeks: RECENT_WEEKS,
				},
			},
			{
				params: { slug: 'work' },
				props: {
					path: '/work',
					title: WORK_PAGE.heading,
					description: WORK_PAGE.description,
					recentWeeks: RECENT_WEEKS,
				},
			},
			{
				params: { slug: 'rigtch' },
				props: {
					path: '/rigtch',
					title: 'rigtch.fm',
					description: RIGTCH_PAGE.description,
				},
			},
			{
				params: { slug: 'blog' },
				props: {
					path: '/blog',
					title: BLOG_PAGE.heading,
					description: BLOG_PAGE.description,
				},
			},
		])
		expect(getPublishedPosts).toHaveBeenCalledExactlyOnceWith()
		expect(loadRecentWeekLevels).toHaveBeenCalledExactlyOnceWith('2026-11-25')
	})

	it('gives every published post its own image slug and front matter title', async () => {
		vi.mocked(getPublishedPosts).mockResolvedValue([
			makePost('first-post', 'First post title', {
				description: 'First description.',
				tags: ['Engineering', 'Storage'],
				body: 'word '.repeat(441),
			}),
			makePost('nested/second-post', 'A different post title', {
				description: 'Second description.',
				publishedAt: new Date('2025-02-03'),
			}),
		])
		const paths = await getStaticPaths()

		expect(paths).toHaveLength(6)
		expect(paths.slice(4)).toStrictEqual([
			{
				params: { slug: 'blog/first-post' },
				props: {
					path: '/blog',
					title: 'First post title',
					description: 'First description.',
					footer: `2026-11-25 · 3 ${BLOG_PAGE.readingTime} · Engineering`,
				},
			},
			{
				params: { slug: 'blog/nested/second-post' },
				props: {
					path: '/blog',
					title: 'A different post title',
					description: 'Second description.',
					footer: `2025-02-03 · 1 ${BLOG_PAGE.readingTime}`,
				},
			},
		])
		expect(new Set(paths.map(({ params }) => params.slug)).size).toBe(6)
	})

	it.each([
		[0, 1],
		[220, 1],
		[221, 2],
		[440, 2],
	])(
		'formats %i words as %i reading minutes without an empty tag separator',
		async (words, minutes) => {
			vi.mocked(getPublishedPosts).mockResolvedValue([
				makePost('post', 'Post', { body: 'word '.repeat(words) }),
			])
			const paths = await getStaticPaths()

			expect(paths[4].props).toStrictEqual({
				path: '/blog',
				title: 'Post',
				description: 'Fixture post description.',
				footer: `2026-11-25 · ${minutes} ${BLOG_PAGE.readingTime}`,
			})
		}
	)

	it('uses UTC dates for the build window and post footer', async () => {
		vi.setSystemTime(new Date('2026-11-25T23:30:00-02:00'))
		vi.mocked(getPublishedPosts).mockResolvedValue([
			makePost('post', 'Post', {
				publishedAt: new Date('2024-02-29T23:30:00-02:00'),
			}),
		])
		const paths = await getStaticPaths()

		expect(loadRecentWeekLevels).toHaveBeenCalledExactlyOnceWith('2026-11-26')
		expect(paths[4].props.footer).toBe(
			`2024-03-01 · 1 ${BLOG_PAGE.readingTime}`
		)
	})
})
