import type { z } from 'zod'
import {
	monthFactSchema,
	numberFactSchema,
	type productSchema,
} from '../domain/profile.schemas'

const STORES_EVERY_PLAY_POST = 'why-rigtch-fm-stores-every-play'
const STORES_EVERY_PLAY_SOURCE = `Igor's post src/content/blog/${STORES_EVERY_PLAY_POST}.mdx`

const LISTENERS = numberFactSchema.parse({
	value: 73_000,
	label: 'listeners',
	source: 'rigtch.fm production database',
	checkedOn: '2026-11-25',
})

export const PLAYS_STORED = numberFactSchema.parse({
	value: 362_000_000,
	label: 'plays stored',
	source: 'rigtch.fm production database',
	checkedOn: '2026-11-25',
})

const EVERY_PLAY_SAVED_SINCE = monthFactSchema.parse({
	value: '2024-03',
	label: 'every play saved since',
	source: STORES_EVERY_PLAY_SOURCE,
	checkedOn: '2026-11-25',
})

const PAID_PLAN_LIVE = monthFactSchema.parse({
	value: '2026-03',
	label: 'paid plan live',
	source: 'rigtch.fm billing records',
	checkedOn: '2026-11-25',
})

/** Last month rigtch.fm web ran on Next.js, tRPC and Vercel. */
export const OLD_WEB_STACK_UNTIL = monthFactSchema.parse({
	value: '2026-02',
	label: 'Next.js, tRPC and Vercel until',
	source: 'rigtch.fm repository history',
	checkedOn: '2026-11-25',
})

export const PRODUCT = {
	name: 'rigtch.fm',
	url: 'https://rigtch.fm',
	kind: 'own product',
	tagline: 'Built and run solo',
	summary:
		'Spotify listening stats available all year, not just during Wrapped. Listeners connect their Spotify account, import their full listening history and get shareable top artists and tracks.',
	whatIDo:
		'I build and run it alone: API, web app, billing, SEO and support. Most of the traffic comes from Google search.',
	stack:
		'TypeScript, NestJS on Bun, PostgreSQL, BullMQ, TanStack Start, oRPC, hosted on Railway.',
	commitStripLegend:
		'One square is one week of my git commits to rigtch.fm since November 2022.',
	facts: [LISTENERS, PLAYS_STORED, PAID_PLAN_LIVE],
	pageFacts: [LISTENERS, PLAYS_STORED, EVERY_PLAY_SAVED_SINCE, PAID_PLAN_LIVE],
	history: [
		{
			month: {
				value: '2022-11',
				label: 'first version',
				source: STORES_EVERY_PLAY_SOURCE,
				checkedOn: '2026-11-25',
			},
			title: 'First version.',
			text: 'Fetched a ranking from the Spotify API and displayed the response. No plays were stored.',
		},
		{
			month: EVERY_PLAY_SAVED_SINCE,
			title: 'Every play saved.',
			text: 'Spotify returns only the last 50 plays and no play counts, so the app started recording its own history.',
			postId: STORES_EVERY_PLAY_POST,
		},
		{
			month: OLD_WEB_STACK_UNTIL,
			title: 'New platform.',
			text: 'Moved from Vercel to Railway, Next.js to TanStack Start and tRPC to oRPC.',
		},
		{
			month: PAID_PLAN_LIVE,
			title: 'Paid plan live.',
			text: 'Billing, refunds and support are handled by me.',
		},
	],
} satisfies z.input<typeof productSchema>
