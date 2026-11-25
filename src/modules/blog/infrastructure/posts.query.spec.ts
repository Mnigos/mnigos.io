import type { CollectionEntry } from 'astro:content'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPostPaths, getPublishedPosts } from './posts.query'

type BlogFilter = (post: CollectionEntry<'blog'>) => boolean
type BlogCollectionReader = (
	collection: 'blog',
	filter?: BlogFilter
) => Promise<CollectionEntry<'blog'>[]>

const { getCollectionMock } = vi.hoisted(() => ({
	getCollectionMock: vi.fn<BlogCollectionReader>(),
}))

vi.mock('astro:content', () => ({ getCollection: getCollectionMock }))

function makePost(draft: boolean): CollectionEntry<'blog'> {
	return {
		id: draft ? 'draft-post' : 'published-post',
		collection: 'blog',
		data: {
			title: 'Fixture post',
			description: 'Fixture description.',
			publishedAt: new Date('2026-11-25'),
			tags: [],
			draft,
		},
	}
}

afterEach(() => vi.resetAllMocks())

describe('published blog routes', () => {
	it('filters drafts before supplying posts to page and image callers', async () => {
		const published = makePost(false)
		getCollectionMock.mockImplementation(async (_collection, filter) =>
			[published, makePost(true)].filter(post => filter?.(post) ?? true)
		)

		expect(await getPublishedPosts()).toStrictEqual([published])
		expect(getCollectionMock).toHaveBeenCalledTimes(1)
		const [[collection, filter]] = getCollectionMock.mock.calls

		expect(collection).toBe('blog')
		expect(filter?.(makePost(false))).toBe(true)
		expect(filter?.(makePost(true))).toBe(false)
	})

	it('uses the same draft filter when generating post pages', async () => {
		const published = makePost(false)
		getCollectionMock.mockImplementation(async (_collection, filter) =>
			[published, makePost(true)].filter(post => filter?.(post) ?? true)
		)

		expect(await getPostPaths()).toStrictEqual([
			{
				params: { id: 'published-post' },
				props: { post: published, previous: undefined, next: undefined },
			},
		])
		const [[collection, filter]] = getCollectionMock.mock.calls

		expect(collection).toBe('blog')
		expect(filter?.(makePost(true))).toBe(false)
		expect(filter?.(published)).toBe(true)
	})
})
