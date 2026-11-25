import { Resvg } from '@resvg/resvg-js'
import type { APIContext } from 'astro'
import satori from 'satori'
import { BLOG_PAGE } from '../../blog/content/blog-page.content'
import { formatIsoDate, getReadingMinutes } from '../../blog/domain/post.helper'
import { getPublishedPosts } from '../../blog/infrastructure/posts.query'
import { PROFILE } from '../../profile/content/profile.content'
import { RIGTCH_PAGE } from '../../rigtch/content/rigtch-page.content'
import { HOME_PAGE } from '../../site/content/home-page.content'
import { WORK_PAGE } from '../../work/content/work-page.content'
import { PREVIEW_IMAGE } from '../domain/preview-image.constants'
import { fitPreviewTitle } from '../domain/preview-title.helper'
import { loadPreviewAssets } from '../infrastructure/preview-assets.query'
import { loadRecentWeekLevels } from '../infrastructure/recent-contributions.query'
import { getContributionStrip } from './contribution-strip.helper'

const { width, height, padding, type, title, description } = PREVIEW_IMAGE

interface PreviewImageProps {
	path: string
	title: string
	description: string
	footer?: string
	recentWeeks?: number[]
}

interface PreviewImage extends PreviewImageProps {
	slug: string
}

export async function getStaticPaths() {
	const posts = await getPublishedPosts()
	const recentWeeks = await loadRecentWeekLevels(
		new Date().toISOString().slice(0, 10)
	)
	const images: PreviewImage[] = [
		{
			slug: 'home',
			path: '/',
			title: PROFILE.name,
			description: HOME_PAGE.description,
			recentWeeks,
		},
		{
			slug: 'work',
			path: '/work',
			title: WORK_PAGE.heading,
			description: WORK_PAGE.description,
			recentWeeks,
		},
		{
			slug: 'rigtch',
			path: '/rigtch',
			title: PROFILE.product.name,
			description: RIGTCH_PAGE.description,
		},
		{
			slug: 'blog',
			path: '/blog',
			title: BLOG_PAGE.heading,
			description: BLOG_PAGE.description,
		},
		...posts.map(({ id, body, data }) => ({
			slug: `blog/${id}`,
			path: '/blog',
			title: data.title,
			description: data.description,
			footer: [
				formatIsoDate(data.publishedAt),
				`${getReadingMinutes(body ?? '')} ${BLOG_PAGE.readingTime}`,
				...data.tags.slice(0, 1),
			].join(' · '),
		})),
	]

	return images.map(({ slug, ...props }) => ({ params: { slug }, props }))
}

export async function GET({ props }: APIContext<PreviewImageProps>) {
	const { fonts, colors, logo } = await loadPreviewAssets()
	const { fontSize, lineClamp } = fitPreviewTitle(props.title)
	const { hostname } = new URL(import.meta.env.SITE)
	const tldStart = hostname.lastIndexOf('.')
	const mono = {
		fontFamily: 'Martian Mono',
		fontWeight: 400,
		fontSize: 28,
		color: colors.dim,
	}
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
	const bottom = props.footer
		? {
				type: 'div',
				props: { style: { ...mono, marginTop: 40 }, children: props.footer },
			}
		: props.recentWeeks &&
			getContributionStrip(props.recentWeeks, colors.levels)
	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					flexDirection: 'column',
					boxSizing: 'border-box',
					width,
					height,
					padding: `${padding.y}px ${padding.x}px`,
					backgroundColor: colors.bg,
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								paddingBottom: 24,
								borderBottom: `2px solid ${colors.line}`,
								fontFamily: 'Archivo',
								fontSize: 36,
								color: colors.dim,
							},
							children: [
								{
									type: 'div',
									props: {
										style: { display: 'flex', alignItems: 'center', gap: 22 },
										children: [
											{
												type: 'img',
												props: { src: logo, width: 52, height: 58 },
											},
											siteName,
										],
									},
								},
								{ type: 'div', props: { style: mono, children: props.path } },
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
								marginTop: 'auto',
								paddingBottom: 24,
								borderBottom: `4px solid ${colors.ink}`,
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
					{
						type: 'div',
						props: {
							style: {
								display: 'block',
								lineClamp: description.lineClamp,
								marginTop: 24,
								fontFamily: 'Archivo',
								fontSize: description.fontSize,
								lineHeight: description.lineHeight,
								color: colors.dim,
							},
							children: props.description,
						},
					},
					bottom,
				],
			},
		},
		{ width, height, fonts }
	)

	return new Response(new Uint8Array(new Resvg(svg).render().asPng()), {
		headers: { 'Content-Type': type },
	})
}
