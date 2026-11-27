import type { z } from 'zod'
import { formatFactValue, formatMonth } from '../domain/profile-format.helper'
import { numberFactSchema, profileSchema } from '../domain/profile.schemas'
import { OLD_WEB_STACK_UNTIL, PLAYS_STORED, PRODUCT } from './product.content'

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
	product: PRODUCT,
	jobs: [
		{
			company: 'Ludus AI',
			role: 'Fullstack Developer',
			period: { start: '2025-06' },
			description:
				'Ludus AI is an AI assistant for Unreal Engine, used by 30,000+ developers. I own its web platform and a large part of its infrastructure and security.',
			groups: [
				{
					title: 'Product',
					items: [
						'Account web app, landing page and the web UI of the Unreal Engine plugin',
						'Took over a full rewrite of the web app and shipped it to production',
						'Took ownership of Stripe billing and made it reliable',
						'Custom OAuth authorization that connects user accounts with the Unreal Engine plugin and AI integrations',
						'LudusMCP, an integration layer that connects Ludus AI with external AI agents',
						'Trial abuse detection with automatic containment and alerts',
						'Admin views for support workflows',
						'Product analytics on PostHog, Google Tag Manager events and server-side conversion tracking for ad platforms',
					].map(text => ({ text })),
				},
				{
					title: 'Security and compliance',
					items: [
						'Led the security work for ISO 27001 and SOC 2 Type 2',
						'Vulnerability management for code, dependencies, Docker images and cloud configuration',
						'Strict Content Security Policy and unified security headers',
						'GDPR: account erasure across web and API, consent handling, data retention',
					].map(text => ({ text })),
				},
				{
					title: 'Infrastructure',
					items: [
						'Cloudflare: Workers, WAF, Zero Trust, DNS and email security',
						'Google Cloud: load balancer configuration, Cloud Armor rules, alerting on permission and audit-log changes',
						'Release management, CI pipelines and automatic database migrations',
						'Observability: telemetry pipeline, Sentry triage and production alerts',
					].map(text => ({ text })),
				},
				{
					title: 'Code quality',
					items: [
						'Introduced lint rules and coding standards that raised code quality across the web repository',
						'Migrated the web projects into a monorepo, speeding up development',
					].map(text => ({ text })),
				},
			],
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
							text: 'A news portal. Main author of the codebase from week one to production releases. Component library, article and author pages, sign-up with email confirmation, comments, Algolia search and the Political Compass quiz.',
						},
						{
							title: 'Reducto',
							text: 'A US AI startup for document processing. Rebuilt the marketing site inside their product repository: new homepage, pricing page, careers page with an application form and a blog on Sanity. Set up Storybook and built a new set of UI components and a multi-step Flow component.',
						},
						{
							title: 'Casual Fitters',
							text: 'A London tailoring brand. Online store with a suit customiser and appointment booking. Joined near the end of a late project to help finish it, completing the remaining work, fixing earlier bugs and releasing the store.',
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
				'Crypto startup running token launches, including Kanga Exchange, Metahero, Everdome and Fame MMA. I built the web apps for its products across front end and back end.',
			groups: [
				{
					title: 'Projects',
					items: [
						'Tenset Infinity, the staking platform with airdrops: one of the main contributors to both versions, first in Vue, then in React',
						'An AI assistant on the OpenAI API (2023): a NestJS and PostgreSQL service with vector search that answered community questions on Discord, Telegram and LINE, plus an admin panel in Remix',
						'Main company website and the shared React component library',
						'NFT marketplace with auctions, vesting tools and internal token-burning applications',
						'REST APIs in NestJS reading data from smart contracts, and scripts for analysing blockchain data',
						'The API behind Tenset Governance, where 10SET holders vote in community polls weighted by their subscription tier',
					].map(text => ({ text })),
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
				{
					technology: 'Remix, React Router 7',
					usedAt: ['Ludus AI before TanStack Start', 'Tenset'],
				},
				{
					technology: 'Next.js',
					usedAt: ['Blazity', `rigtch.fm until ${oldWebStackUntil}`],
				},
				{ technology: 'Vue', usedAt: ['Tenset', 'own projects'] },
				{ technology: 'Vite', usedAt: ['rigtch.fm', 'Ludus AI', 'Tenset'] },
				{ technology: 'Tailwind CSS', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{ technology: 'React Native, Expo', usedAt: ['rigtch.fm mobile app'] },
				{
					technology: 'Storybook',
					usedAt: ['Blazity', 'rigtch.fm', 'own projects'],
				},
			],
		},
		{
			title: 'Back end',
			entries: [
				{ technology: 'NestJS', usedAt: ['rigtch.fm', 'Tenset'] },
				{ technology: 'Hono', usedAt: ['rigtch.fm', 'platform-hono'] },
				{ technology: 'Node.js', usedAt: ['every job and project'] },
				{ technology: 'Bun', usedAt: ['rigtch.fm'] },
				{ technology: 'oRPC', usedAt: ['rigtch.fm', 'contributor'] },
				{
					technology: 'Effect',
					usedAt: ['own projects', 'T3 Code contributions'],
				},
				{
					technology: 'BullMQ',
					usedAt: ['rigtch.fm', `${formatFactValue(QUEUES.value)} queues`],
				},
				{ technology: 'Redis', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{
					technology: 'REST, GraphQL',
					usedAt: ['Tenset APIs', 'early rigtch.fm versions'],
				},
				{ technology: 'OAuth', usedAt: ['Ludus AI', 'rigtch.fm', 'Blazity'] },
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
				{ technology: 'Neon', usedAt: ['Ludus AI', 'own projects'] },
				{ technology: 'Drizzle', usedAt: ['rigtch.fm', 'Ludus AI'] },
				{
					technology: 'Prisma',
					usedAt: ['Ludus AI and rigtch.fm before Drizzle', 'Blazity'],
				},
				{ technology: 'TypeORM', usedAt: ['rigtch.fm until 2024'] },
				{ technology: 'S3-compatible storage', usedAt: ['rigtch.fm'] },
			],
		},
		{
			title: 'Payments and analytics',
			entries: [
				{ technology: 'Stripe', usedAt: ['Ludus AI billing'] },
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
				{
					technology: 'Cloudflare',
					usedAt: ['Workers, WAF and Zero Trust at Ludus AI'],
				},
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
					usedAt: [`rigtch.fm web until ${oldWebStackUntil}`, 'Blazity'],
				},
			],
		},
		{
			title: 'Testing and tooling',
			entries: [
				{
					technology: 'Vitest, Playwright, Testing Library',
					usedAt: ['rigtch.fm', 'Ludus AI', 'Blazity'],
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
					technology: 'Claude Code, Codex, T3 Code',
					usedAt: ['every day', 'side by side'],
				},
				{ technology: 'OpenAI API, vector search', usedAt: ['Tenset', '2023'] },
				{ technology: 'AI SDK', usedAt: ['rigtch.fm'] },
			],
		},
		{
			title: 'Content and search',
			entries: [
				{ technology: 'Sanity, Algolia', usedAt: ['Blazity'] },
				{ technology: 'Strapi', usedAt: ['own projects', 'Tenset'] },
			],
		},
		{
			title: 'Learning',
			entries: [{ technology: 'Rust', usedAt: ['after hours'] }],
		},
	],
	work: {
		intro: 'My own product first, then my jobs, newest first.',
		weeklyStripLegend:
			'One square is one week of my GitHub and GitLab contributions.',
	},
} satisfies z.input<typeof profileSchema>)
