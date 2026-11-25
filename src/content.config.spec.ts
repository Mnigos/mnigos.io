import { describe, expect, it } from 'vitest'
import { blogSchema } from './content.config'

describe('blogSchema', () => {
	const frontmatter = {
		title: 'Hello',
		description: 'First post',
		publishedAt: '2026-11-25',
	}

	it('parses frontmatter and fills defaults', () => {
		expect(blogSchema.parse(frontmatter)).toStrictEqual({
			...frontmatter,
			publishedAt: new Date('2026-11-25'),
			tags: [],
			draft: false,
		})
	})

	it('rejects frontmatter without a title', () => {
		const { title: _title, ...withoutTitle } = frontmatter

		expect(blogSchema.safeParse(withoutTitle).success).toBe(false)
	})
})
