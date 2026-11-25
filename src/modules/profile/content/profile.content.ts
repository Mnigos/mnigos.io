import type { z } from 'zod'
import { formatFactValue, formatMonth } from '../domain/profile-format.helper'
import {
	monthFactSchema,
	numberFactSchema,
	profileSchema,
} from '../domain/profile.schemas'

const PLAYS_STORED = numberFactSchema.parse({
	value: 362_000_000,
	label: 'plays stored',
	source: 'rigtch.fm production database',
	checkedOn: '2026-11-25',
})

const QUEUES = numberFactSchema.parse({
	value: 17,
	label: 'queues',
	source: 'rigtch.fm API source code',
	checkedOn: '2026-11-25',
})

const OXLINT_RULES = numberFactSchema.parse({
	value: 13,
	label: 'rules of my own',
	source: 'rigtch.fm repository, tooling/oxlint-plugin/rigtch.plugin.mts',
	checkedOn: '2026-11-25',
})

const ORPC_MERGED_PULL_REQUESTS = numberFactSchema.parse({
	value: 5,
	label: 'merged pull requests',
	source:
		'https://github.com/middleapi/orpc/pulls?q=is%3Apr+is%3Amerged+author%3AMnigos',
	checkedOn: '2026-11-25',
})

/** Last month rigtch.fm web ran on Next.js, tRPC and Vercel. */
const OLD_WEB_STACK_UNTIL = monthFactSchema.parse({
	value: '2026-02',
	label: 'Next.js, tRPC and Vercel until',
	source: 'rigtch.fm repository history',
	checkedOn: '2026-11-25',
})
const oldWebStackUntil = formatMonth(OLD_WEB_STACK_UNTIL.value)

export const PROFILE = profileSchema.parse({
	name: 'Igor Makowski',
	intro: 'Building rigtch.fm solo. Full‑stack developer at Ludus AI.',
	links: [
		{ label: 'GitHub', url: 'https://github.com/Mnigos' },
		{ label: 'X', url: 'https://x.com/mnigos0' },
		{
			label: 'LinkedIn',
			url: 'https://www.linkedin.com/in/igor-makowski-b30684206/',
		},
		{ label: 'RSS', url: '/rss.xml' },
	],
	product: {
		name: 'rigtch.fm',
		url: 'https://rigtch.fm',
		kind: 'own product',
		tagline: 'Built and run solo',
		summary:
			'Spotify listening stats that are available all year, not only during Wrapped. Listeners connect their Spotify account, import their full listening history and get their top artists and tracks, which they can share.',
		whatIDo:
			'I build and run it alone: API, web app, billing, SEO and support. Most of the traffic comes from Google search.',
		stack:
			'TypeScript, NestJS on Bun, PostgreSQL, BullMQ, TanStack Start, oRPC, hosted on Railway.',
		facts: [
			{
				value: 73_000,
				label: 'listeners',
				source: 'rigtch.fm production database',
				checkedOn: '2026-11-25',
			},
			PLAYS_STORED,
			{
				value: '2026-03',
				label: 'paid plan live',
				source: 'rigtch.fm billing records',
				checkedOn: '2026-11-25',
			},
		],
	},
	jobs: [
		{
			company: 'Ludus AI',
			role: 'Fullstack Developer',
			period: { start: '2025-06' },
			description:
				'Ludus AI is an AI assistant for Unreal Engine, used by 30,000+ developers.',
			groups: [],
		},
		{
			company: 'Blazity',
			role: 'Frontend Developer',
			period: { start: '2024-10', end: '2025-05' },
			description: 'Software agency. I worked on client projects in Next.js.',
			groups: [
				{
					items: [
						{
							title: 'Visegrad24',
							text: 'A news portal. Main author of the codebase from the first week to production releases. Component library, article and author pages, sign-up with email confirmation, comments, Algolia search and the Political Compass quiz.',
						},
						{
							title: 'Reducto',
							text: 'A US AI startup for document processing. Rebuilt the marketing site inside their product repository: new homepage, pricing page, careers page with an application form and a blog on Sanity. Set up Storybook and built a new set of UI components and a multi-step Flow component.',
						},
						{
							title: 'Casual Fitters',
							text: 'A London tailoring brand. Online store with a suit customiser and appointment booking.',
						},
					],
				},
			],
		},
		{
			company: 'Tenset',
			role: 'Software Engineer',
			period: { start: '2021-08', end: '2024-03' },
			description:
				'Crypto startup running token launches, among them Kanga Exchange, Metahero, Everdome and Fame MMA. I built the web apps around its products, front end and back end.',
			groups: [
				{
					title: 'Projects',
					items: [
						{
							text: 'Tenset Infinity, the staking platform with airdrops: one of the main contributors to both versions, first in Vue, then in React',
						},
						{
							text: 'An AI assistant on the OpenAI API (2023): a NestJS and PostgreSQL service with vector search that answered community questions on Discord, Telegram and LINE, plus an admin panel in Remix',
						},
						{
							text: 'Main company website and the shared React component library',
						},
						{
							text: 'NFT marketplace with auctions, vesting tools and internal token-burning applications',
						},
						{
							text: 'REST APIs in NestJS that read data from smart contracts, and scripts for analysing blockchain data',
						},
						{
							text: 'The API behind Tenset Governance, where 10SET holders vote in community polls with a weight based on their subscription tier',
						},
					],
				},
			],
		},
	],
	openSource: {
		link: { label: 'github.com/Mnigos', url: 'https://github.com/Mnigos' },
		projects: [
			{
				name: 'T3 Code',
				url: 'https://github.com/pingdotgg/t3code',
				fact: {
					value: 43,
					label: 'merged pull requests',
					source:
						'https://github.com/pingdotgg/t3code/pulls?q=is%3Apr+is%3Amerged+author%3AMnigos',
					checkedOn: '2026-11-25',
				},
			},
			{
				name: 'oRPC',
				note: 'Including Hono support for NestJS',
				url: 'https://github.com/middleapi/orpc',
				fact: ORPC_MERGED_PULL_REQUESTS,
			},
			{
				name: 'posthog-js',
				url: 'https://github.com/PostHog/posthog-js',
				fact: {
					value: 1,
					label: 'merged pull request',
					source:
						'https://github.com/PostHog/posthog-js/pulls?q=is%3Apr+is%3Amerged+author%3AMnigos',
					checkedOn: '2026-11-25',
				},
			},
			{
				name: 'platform-hono',
				note: 'My NestJS adapter for Hono',
				url: 'https://github.com/Mnigos/platform-hono',
				fact: {
					value: 5400,
					label: 'npm downloads a month',
					source: 'https://www.npmjs.com/package/@mnigos/platform-hono',
					checkedOn: '2026-11-25',
				},
			},
		],
	},
	stack: [
		{
			title: 'Front end',
			entries: [
				{
					technology: 'TypeScript, React',
					usedAt: ['every job and project since 2021'],
				},
				{
					technology: 'TanStack Start, Router, Query',
					usedAt: ['rigtch.fm', 'Ludus AI'],
				},
				{ technology: 'Remix, React Router 7', usedAt: ['Ludus AI', 'Tenset'] },
				{
					technology: 'Next.js',
					usedAt: ['Blazity', `rigtch.fm until ${oldWebStackUntil}`],
				},
				{ technology: 'Vue', usedAt: ['Tenset', 'own projects'] },
				{ technology: 'Vite', usedAt: ['rigtch.fm', 'Ludus AI', 'Tenset'] },
				{ technology: 'Tailwind CSS', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{
					technology: 'Storybook',
					usedAt: ['Blazity', 'rigtch.fm', 'own projects'],
				},
			],
		},
		{
			title: 'Back end',
			entries: [
				{
					technology: 'NestJS, Hono',
					usedAt: ['rigtch.fm', 'Tenset', 'platform-hono'],
				},
				{
					technology: 'Bun, Node.js',
					usedAt: ['rigtch.fm on Bun', 'Node.js before'],
				},
				{
					technology: 'oRPC',
					usedAt: [
						'rigtch.fm',
						`${formatFactValue(ORPC_MERGED_PULL_REQUESTS.value)} merged pull requests`,
					],
				},
				{
					technology: 'Effect',
					usedAt: ['own projects', 'T3 Code contributions'],
				},
				{
					technology: 'BullMQ, Redis',
					usedAt: ['rigtch.fm', `${formatFactValue(QUEUES.value)} queues`],
				},
				{
					technology: 'REST, GraphQL',
					usedAt: ['Tenset APIs', 'early rigtch.fm versions'],
				},
				{
					technology: 'OAuth',
					usedAt: ['Ludus AI', 'Spotify login in rigtch.fm'],
				},
				{ technology: 'Better Auth', usedAt: ['rigtch.fm'] },
				{ technology: 'tRPC', usedAt: [`rigtch.fm until ${oldWebStackUntil}`] },
			],
		},
		{
			title: 'Data',
			entries: [
				{
					technology: 'PostgreSQL',
					usedAt: [
						`rigtch.fm with ${formatFactValue(PLAYS_STORED.value)} plays`,
						'Ludus AI',
						'Tenset',
					],
				},
				{ technology: 'Drizzle', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{
					technology: 'Prisma',
					usedAt: ['Ludus AI', 'rigtch.fm before Drizzle', 'Visegrad24'],
				},
				{ technology: 'TypeORM', usedAt: ['rigtch.fm until 2024'] },
				{ technology: 'S3-compatible storage', usedAt: ['rigtch.fm'] },
			],
		},
		{
			title: 'Payments and analytics',
			entries: [
				{ technology: 'Stripe', usedAt: ['Ludus AI'] },
				{ technology: 'Dodo Payments', usedAt: ['rigtch.fm'] },
				{ technology: 'PostHog, Sentry', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{
					technology: 'Google Tag Manager, Search Console',
					usedAt: ['Ludus AI', 'rigtch.fm'],
				},
				{ technology: 'OpenTelemetry', usedAt: ['rigtch.fm', 'Ludus AI'] },
			],
		},
		{
			title: 'Infrastructure',
			entries: [
				{ technology: 'Cloudflare', usedAt: ['Ludus AI'] },
				{ technology: 'Google Cloud', usedAt: ['Ludus AI'] },
				{ technology: 'Docker', usedAt: ['Ludus AI'] },
				{
					technology: 'Railway',
					usedAt: [
						'rigtch.fm',
						'API since 09.2025',
						`web since ${oldWebStackUntil}`,
					],
				},
				{
					technology: 'Vercel',
					usedAt: [`rigtch.fm web until ${oldWebStackUntil}`],
				},
			],
		},
		{
			title: 'Testing and tooling',
			entries: [
				{
					technology: 'Vitest, Playwright, Testing Library',
					usedAt: ['rigtch.fm', 'Ludus AI'],
				},
				{
					technology: 'oxlint',
					usedAt: [
						`rigtch.fm with ${formatFactValue(OXLINT_RULES.value)} rules of my own`,
						'Ludus AI',
					],
				},
				{ technology: 'Turborepo', usedAt: ['rigtch.fm', 'Ludus AI'] },
			],
		},
		{
			title: 'AI',
			entries: [
				{
					technology: 'Claude Code, Codex',
					usedAt: ['every day', 'side by side'],
				},
				{ technology: 'OpenAI API, vector search', usedAt: ['Tenset', '2023'] },
				{ technology: 'AI SDK', usedAt: ['rigtch.fm'] },
			],
		},
		{
			title: 'Content and search',
			entries: [{ technology: 'Sanity, Algolia', usedAt: ['Blazity'] }],
		},
		{
			title: 'Learning',
			entries: [{ technology: 'Rust', usedAt: ['after hours'] }],
		},
	],
} satisfies z.input<typeof profileSchema>)
