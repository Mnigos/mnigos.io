import { PREVIEW_IMAGE } from './preview-image.constants'

/** `image` is a path on the site; `publishedAt` marks the page as an article. */
export interface PageMetaInput {
	site: string
	pathname: string
	title: string
	description: string
	image: string
	publishedAt?: Date
	xProfileUrl?: string
}

export type MetaTag =
	| { name: string; content: string }
	| { property: string; content: string }

export function getPageMeta({
	site,
	pathname,
	title,
	description,
	image,
	publishedAt,
	xProfileUrl,
}: PageMetaInput) {
	const url = new URL(pathname, site).href
	const imageUrl = new URL(image, site).href
	const xHandle = xProfileUrl && `@${new URL(xProfileUrl).pathname.slice(1)}`
	const tags: MetaTag[] = [
		{ name: 'description', content: description },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:url', content: url },
		{ property: 'og:type', content: publishedAt ? 'article' : 'website' },
		{ property: 'og:site_name', content: new URL(site).hostname },
		{ property: 'og:image', content: imageUrl },
		{ property: 'og:image:type', content: PREVIEW_IMAGE.type },
		{ property: 'og:image:width', content: String(PREVIEW_IMAGE.width) },
		{ property: 'og:image:height', content: String(PREVIEW_IMAGE.height) },
		{ property: 'og:image:alt', content: title },
		...(publishedAt
			? [
					{
						property: 'article:published_time',
						content: publishedAt.toISOString(),
					},
				]
			: []),
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: imageUrl },
		{ name: 'twitter:image:alt', content: title },
		...(xHandle
			? [
					{ name: 'twitter:site', content: xHandle },
					{ name: 'twitter:creator', content: xHandle },
				]
			: []),
	]

	return { canonical: url, tags }
}
