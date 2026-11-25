import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET() {
	const posts = await getCollection('blog', ({ data }) => !data.draft)

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
