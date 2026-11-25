import type { CollectionEntry } from 'astro:content'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BLOG_PAGE } from '../../blog/content/blog-page.content'
import { getPublishedPosts } from '../../blog/infrastructure/posts.query'
import { PROFILE } from '../../profile/content/profile.content'
import { WORK_PAGE } from '../../work/content/work-page.content'
import { getStaticPaths } from './preview-image.handler'

vi.mock('../../blog/infrastructure/posts.query', () => ({
	getPublishedPosts: vi.fn(),
}))

function makePost(id: string, title: string): CollectionEntry<'blog'> {
	return {
		id,
		collection: 'blog',
		data: {
			title,
			description: 'Fixture post description.',
			publishedAt: new Date('2026-11-25'),
			tags: [],
			draft: false,
		},
	}
}

afterEach(() => vi.resetAllMocks())

describe('preview image getStaticPaths', () => {
	it('generates the three page images when there are no published posts', async () => {
		vi.mocked(getPublishedPosts).mockResolvedValue([])

		expect(await getStaticPaths()).toStrictEqual([
			{ params: { slug: 'home' }, props: { title: PROFILE.name } },
			{ params: { slug: 'work' }, props: { title: WORK_PAGE.heading } },
			{ params: { slug: 'blog' }, props: { title: BLOG_PAGE.heading } },
		])
		expect(getPublishedPosts).toHaveBeenCalledExactlyOnceWith()
	})

	it('gives every published post its own image slug and front matter title', async () => {
		vi.mocked(getPublishedPosts).mockResolvedValue([
			makePost('first-post', 'First post title'),
			makePost('nested/second-post', 'A different post title'),
		])
		const paths = await getStaticPaths()

		expect(paths).toHaveLength(5)
		expect(paths.slice(3)).toStrictEqual([
			{
				params: { slug: 'blog/first-post' },
				props: { title: 'First post title' },
			},
			{
				params: { slug: 'blog/nested/second-post' },
				props: { title: 'A different post title' },
			},
		])
		expect(new Set(paths.map(({ params }) => params.slug)).size).toBe(5)
	})
})
