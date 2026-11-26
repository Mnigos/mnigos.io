import type { z } from 'zod'
import { usesPageSchema } from '../domain/uses.schemas'

export const USES_PAGE = usesPageSchema.parse({
	title: 'Uses · mnigos',
	description:
		'What Igor Makowski builds with today, the coding agents he works with and the tools on his desk.',
	heading: 'Uses',
	lede: 'What I build with today and the tools on my desk.',
	defaults: {
		heading: 'What I build with today',
		intro: {
			text: 'My defaults for a new project. Everything I have used, and where, is on Work.',
			link: { label: 'Work', url: '/work' },
		},
		rows: [
			{ label: 'Language', items: [{ names: 'TypeScript', on: ['Bun'] }] },
			{
				label: 'Web',
				items: ['React', ['TanStack Start', 'Router', 'Query'], 'Tailwind CSS'],
			},
			{ label: 'API', items: ['NestJS', 'oRPC', 'Zod'] },
			{
				label: 'Data',
				items: [
					{ names: 'PostgreSQL', on: ['Neon', 'Railway'] },
					'Drizzle',
					'Redis',
					'BullMQ',
				],
			},
			{ label: 'Auth', items: ['Better Auth'] },
			{
				label: 'Testing',
				items: ['Vitest', 'Playwright', 'Testing Library'],
			},
			{ label: 'Tooling', items: ['oxlint', 'Turborepo'] },
			{ label: 'Hosting', items: ['Railway', 'Cloudflare'] },
			{ label: 'Watching', items: ['PostHog', 'Sentry'] },
			{
				label: 'This site',
				items: [{ names: 'Astro', on: ['Cloudflare Workers'] }],
			},
			{ label: 'Learning', items: ['Rust'], note: 'after hours' },
		],
	},
	agents: {
		heading: 'Coding agents',
		entries: [
			{
				tools: [{ name: 'T3 Code', url: 'https://t3.codes' }],
				text: 'Where the work happens: one thread per ticket, several at once.',
				note: 'I also contribute to it.',
			},
			{
				tools: [
					{
						name: 'Claude Code',
						url: 'https://claude.com/product/claude-code',
					},
				],
				text: 'Planning and implementation.',
			},
			{
				tools: [{ name: 'Codex', url: 'https://openai.com/codex/' }],
				text: 'Tests, review and browser checks.',
				note: 'A second model reviews what the first one wrote.',
			},
			{
				tools: [{ name: 'Mac mini' }],
				text: 'Runs agent threads around the clock, so the laptop can sleep.',
			},
			{
				tools: [{ name: 'Phone' }],
				text: "For running coding agents on the go, which happens far more often than I'd like to admit.",
			},
		],
	},
	desk: {
		heading: 'Desk',
		entries: [
			{ tools: [{ name: 'MacBook Pro 16"' }], text: 'M4 Pro, 48 GB.' },
			{
				tools: [
					{
						name: 'Dark Project Gamma',
						url: 'https://darkproject.eu/product/87bGamma',
					},
				],
				text: 'Keyboard for programming.',
				note: 'ALU87B.',
			},
			{
				tools: [
					{
						name: 'Dark Project Novus Pro',
						url: 'https://darkproject.eu/product/NovusPro',
					},
				],
				text: 'Mouse.',
			},
			{
				tools: [{ name: 'Zed', url: 'https://zed.dev' }],
				text: 'Editor.',
				note: 'One Dark Pro Max, Cascadia Code.',
			},
			{
				tools: [{ name: 'Warp', url: 'https://www.warp.dev' }],
				text: 'Terminal, though I rarely open one these days.',
				note: 'The agents run the commands.',
			},
			{
				tools: [{ name: 'Helium', url: 'https://helium.computer' }],
				text: 'Browser.',
			},
			{
				tools: [{ name: 'Raycast', url: 'https://www.raycast.com' }],
				text: 'Launcher and clipboard history.',
			},
			{
				tools: [{ name: 'Wispr Flow', url: 'https://wisprflow.ai' }],
				text: 'Dictation.',
				note: 'Most of my prompts are spoken.',
			},
			{
				tools: [{ name: 'Linear', url: 'https://linear.app' }],
				text: 'Tickets for every project, this site included.',
			},
			{
				tools: [{ name: 'Soonlane', url: 'https://soonlane.com' }],
				text: 'My own app for tasks.',
			},
			{
				tools: [
					{ name: '1Password', url: 'https://1password.com' },
					{ name: 'Tailscale', url: 'https://tailscale.com' },
				],
				text: 'Secrets and the network between my machines.',
			},
		],
	},
	gamingPc: {
		heading: 'Gaming PC',
		rows: [
			{ label: 'Graphics', items: ['GeForce RTX 4070'] },
			{ label: 'Processor', items: ['AMD Ryzen 7 5800X'] },
			{ label: 'Motherboard', items: ['MSI MAG B550 TOMAHAWK'] },
			{ label: 'Memory', items: ['4 × Corsair Vengeance RGB Pro SL'] },
			{ label: 'Cooling', items: ['Fractal Design liquid cooler'] },
			{
				label: 'Keyboard',
				items: ['Dark Project Terra Nostra'],
				note: 'ALU81A',
			},
		],
	},
	music: {
		heading: 'Music',
		entries: [
			{
				tools: [{ name: 'REAPER', url: 'https://www.reaper.fm' }],
				text: 'Recording.',
			},
			{
				tools: [{ name: 'TONE3000', url: 'https://www.tone3000.com' }],
				text: 'Guitar amps in software, through a MOTU interface.',
			},
			{
				tools: [{ name: 'Spotify', url: 'https://www.spotify.com' }],
				text: "And rigtch.fm to see what I've listened to.",
				link: { label: 'rigtch.fm', url: '/rigtch' },
			},
		],
	},
} satisfies z.input<typeof usesPageSchema>)
