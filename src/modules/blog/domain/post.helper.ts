export interface DatedPost {
	data: { publishedAt: Date }
}

export function sortNewestFirst<TPost extends DatedPost>(
	posts: readonly TPost[]
) {
	return posts.toSorted(
		(a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
	)
}

export function formatPostDate(date: Date, month: 'long' | 'short') {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month,
		day: 'numeric',
	})
}
