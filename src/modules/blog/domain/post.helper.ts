const WORDS_PER_MINUTE = 220

export interface DatedPost {
	data: { publishedAt: Date }
}

export interface IdentifiedPost {
	id: string
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

/** Posts publish at UTC midnight, so the UTC calendar day is the one written in front matter. */
export function formatIsoDate(date: Date) {
	return date.toISOString().slice(0, 10)
}

export function getReadingMinutes(body: string) {
	const words = body.match(/\S+/gu)?.length ?? 0

	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/** Expects `posts` sorted newest first: the previous post is the older neighbour. */
export function getPostNeighbours<TPost extends IdentifiedPost>(
	posts: readonly TPost[],
	id: string
) {
	const index = posts.findIndex(post => post.id === id)

	if (index === -1) return { previous: undefined, next: undefined }

	return { previous: posts[index + 1], next: posts[index - 1] }
}
