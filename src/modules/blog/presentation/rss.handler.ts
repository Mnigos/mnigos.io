import rss from '@astrojs/rss'
import { sortNewestFirst } from '../domain/post.helper'
import { getPublishedPosts } from '../infrastructure/posts.query'

export async function GET() {
	const posts = sortNewestFirst(await getPublishedPosts())

	return await rss({
		title: 'mnigos.io',
		description: 'Writing about software engineering.',
		site: import.meta.env.SITE,
		items: posts.map(post => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishedAt,
			link: `/blog/${post.id}`,
		})),
	})
}
