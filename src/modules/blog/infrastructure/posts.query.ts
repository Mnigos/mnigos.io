import { getCollection } from 'astro:content'
import { getPostNeighbours, sortNewestFirst } from '../domain/post.helper'

export async function getPublishedPosts() {
	return await getCollection('blog', ({ data }) => !data.draft)
}

export async function getPostPaths() {
	const posts = sortNewestFirst(await getPublishedPosts())

	return posts.map(post => ({
		params: { id: post.id },
		props: { post, ...getPostNeighbours(posts, post.id) },
	}))
}
