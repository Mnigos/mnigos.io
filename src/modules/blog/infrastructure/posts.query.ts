import { getCollection } from 'astro:content'

export async function getPublishedPosts() {
	return await getCollection('blog', ({ data }) => !data.draft)
}

export async function getPostPaths() {
	const posts = await getPublishedPosts()

	return posts.map(post => ({ params: { id: post.id }, props: { post } }))
}
