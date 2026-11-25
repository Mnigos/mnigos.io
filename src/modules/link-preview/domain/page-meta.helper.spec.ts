import { describe, expect, it } from 'vitest'
import { getPageMeta, type PageMetaInput } from './page-meta.helper'

const page: PageMetaInput = {
	site: 'https://mnigos.io',
	pathname: '/work/',
	title: 'Work · mnigos',
	description: 'A description from page content.',
	image: '/og/work.png',
}

describe('getPageMeta', () => {
	it.each(
		['https://mnigos.io', 'https://mnigos.io/'].flatMap(site =>
			['/', '/work/', '/blog/nested-post/'].map(pathname => ({
				site,
				pathname,
			}))
		)
	)('resolves $pathname against $site', ({ site, pathname }) => {
		const { canonical, tags } = getPageMeta({ ...page, site, pathname })

		expect(canonical).toBe(`https://mnigos.io${pathname}`)
		expect(tags).toContainEqual({ property: 'og:url', content: canonical })
		expect(tags).toContainEqual({
			property: 'og:image',
			content: 'https://mnigos.io/og/work.png',
		})
		expect(tags).toContainEqual({
			name: 'twitter:image',
			content: 'https://mnigos.io/og/work.png',
		})
	})

	it('uses the supplied site instead of a hardcoded production host', () => {
		const { canonical, tags } = getPageMeta({
			...page,
			site: 'https://example.com/',
		})

		expect(canonical).toBe('https://example.com/work/')
		expect(tags).toContainEqual({
			property: 'og:image',
			content: 'https://example.com/og/work.png',
		})
		expect(tags).toContainEqual({
			property: 'og:site_name',
			content: 'example.com',
		})
	})

	it('emits the complete website metadata without article or account tags', () => {
		const { tags } = getPageMeta(page)

		expect(tags).toHaveLength(16)
		expect(tags).toEqual(
			expect.arrayContaining([
				{ name: 'description', content: page.description },
				{ property: 'og:title', content: page.title },
				{ property: 'og:description', content: page.description },
				{ property: 'og:url', content: 'https://mnigos.io/work/' },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:site_name', content: 'mnigos.io' },
				{ property: 'og:image', content: 'https://mnigos.io/og/work.png' },
				{ property: 'og:image:type', content: 'image/png' },
				{ property: 'og:image:width', content: '1200' },
				{ property: 'og:image:height', content: '630' },
				{ property: 'og:image:alt', content: page.title },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: page.title },
				{ name: 'twitter:description', content: page.description },
				{ name: 'twitter:image', content: 'https://mnigos.io/og/work.png' },
				{ name: 'twitter:image:alt', content: page.title },
			])
		)
	})

	it.each([
		['2026-11-25T00:00:00Z', '2026-11-25T00:00:00.000Z'],
		['2026-11-25T00:30:00+02:00', '2026-11-24T22:30:00.000Z'],
		['2026-12-31T23:30:00-02:00', '2027-01-01T01:30:00.000Z'],
	])('marks a post published at %s as an article', (date, expected) => {
		const { tags } = getPageMeta({
			...page,
			pathname: '/blog/nested-post/',
			image: '/og/blog/nested-post.png',
			publishedAt: new Date(date),
		})

		expect(tags).toContainEqual({ property: 'og:type', content: 'article' })
		expect(tags).toContainEqual({
			property: 'article:published_time',
			content: expected,
		})
		expect(tags).not.toContainEqual({ property: 'og:type', content: 'website' })
		expect(tags).toContainEqual({
			property: 'og:image',
			content: 'https://mnigos.io/og/blog/nested-post.png',
		})
	})

	it.each([
		['https://x.com/mnigos0', '@mnigos0'],
		['https://x.com/another_author', '@another_author'],
	])('derives both account tags from %s', (xProfileUrl, expected) => {
		const { tags } = getPageMeta({ ...page, xProfileUrl })

		expect(tags).toContainEqual({ name: 'twitter:site', content: expected })
		expect(tags).toContainEqual({ name: 'twitter:creator', content: expected })
	})

	it('preserves content punctuation for the HTML renderer to escape', () => {
		const title = 'A "title" & <preview>'
		const description = 'Reader\'s "description" & details.'
		const { tags } = getPageMeta({ ...page, title, description })

		expect(tags).toContainEqual({ property: 'og:title', content: title })
		expect(tags).toContainEqual({ name: 'description', content: description })
		expect(tags).toContainEqual({ property: 'og:image:alt', content: title })
		expect(tags).toContainEqual({ name: 'twitter:image:alt', content: title })
	})

	it('uses unique property keys for Open Graph and article tags and name keys for X', () => {
		const { tags } = getPageMeta({
			...page,
			publishedAt: new Date('2026-11-25'),
			xProfileUrl: 'https://x.com/mnigos0',
		})
		const keys = tags.map(tag => ('property' in tag ? tag.property : tag.name))

		expect(new Set(keys).size).toBe(tags.length)
		for (const tag of tags) {
			if ('property' in tag) {
				expect(tag).not.toHaveProperty('name')
				expect(tag.property).toMatch(/^(?:og|article):/u)
			} else {
				expect(tag).not.toHaveProperty('property')
				expect(tag.name).toMatch(/^(?:description$|twitter:)/u)
			}
		}
	})
})
