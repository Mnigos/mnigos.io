import { Resvg } from '@resvg/resvg-js'
import type { APIContext, InferGetStaticPropsType } from 'astro'
import satori from 'satori'
import { BLOG_PAGE } from '../../blog/content/blog-page.content'
import { getPublishedPosts } from '../../blog/infrastructure/posts.query'
import { PROFILE } from '../../profile/content/profile.content'
import { WORK_PAGE } from '../../work/content/work-page.content'
import { PREVIEW_IMAGE } from '../domain/preview-image.constants'
import { fitPreviewTitle } from '../domain/preview-title.helper'
import { loadPreviewAssets } from '../infrastructure/preview-assets.query'

const { width, height, padding, type, title } = PREVIEW_IMAGE

export async function getStaticPaths() {
	const posts = await getPublishedPosts()
	const images = [
		{ slug: 'home', title: PROFILE.name },
		{ slug: 'work', title: WORK_PAGE.heading },
		{ slug: 'blog', title: BLOG_PAGE.heading },
		...posts.map(({ id, data }) => ({ slug: `blog/${id}`, title: data.title })),
	]

	return images.map(image => ({
		params: { slug: image.slug },
		props: { title: image.title },
	}))
}

type PreviewImageProps = InferGetStaticPropsType<typeof getStaticPaths>

export async function GET({ props }: APIContext<PreviewImageProps>) {
	const { fonts, colors, logo } = await loadPreviewAssets()
	const { fontSize, lineClamp } = fitPreviewTitle(props.title)
	const { hostname } = new URL(import.meta.env.SITE)
	const tldStart = hostname.lastIndexOf('.')
	const siteName = {
		type: 'div',
		props: {
			style: { display: 'flex' },
			children: [
				{ type: 'span', props: { children: hostname.slice(0, tldStart) } },
				{
					type: 'span',
					props: {
						style: { color: colors.faint },
						children: hostname.slice(tldStart),
					},
				},
			],
		},
	}
	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					boxSizing: 'border-box',
					width,
					height,
					padding,
					backgroundColor: colors.bg,
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								alignItems: 'center',
								gap: 24,
								fontFamily: 'Archivo',
								fontSize: 40,
								color: colors.dim,
							},
							children: [
								{ type: 'img', props: { src: logo, width: 60, height: 67 } },
								siteName,
							],
						},
					},
					{
						type: 'div',
						props: {
							style: {
								display: 'block',
								lineClamp,
								wordBreak: 'break-word',
								fontFamily: 'Martian Mono',
								fontWeight: 800,
								fontSize,
								lineHeight: title.lineHeight,
								letterSpacing: `${title.letterSpacing}em`,
								color: colors.ink,
							},
							children: props.title,
						},
					},
				],
			},
		},
		{ width, height, fonts }
	)

	return new Response(new Uint8Array(new Resvg(svg).render().asPng()), {
		headers: { 'Content-Type': type },
	})
}
