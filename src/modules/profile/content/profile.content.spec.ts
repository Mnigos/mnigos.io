import { assert, describe, expect, test } from 'vitest'
import { PROFILE } from './profile.content'

function* stringsIn(value: unknown): Generator<string> {
	if (typeof value === 'string') {
		yield value
	} else if (Array.isArray(value)) {
		for (const item of value) yield* stringsIn(item)
	} else if (value !== null && typeof value === 'object') {
		for (const item of Object.values(value)) yield* stringsIn(item)
	}
}

function hasPrivateDetails(value: string): boolean {
	return (
		/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/iu.test(value) ||
		/(?<!\w)\+?\d(?:[\s().-]*\d){8,14}(?!\w)/u.test(value) ||
		/\b(?:phone|tel|mobile number)\b/iu.test(value) ||
		/\b(?:university|degree|diploma|bachelor|master's|BSc|MSc|PhD|studies|school)\b/iu.test(
			value
		) ||
		/\b(?:revenue|MRR|ARR|income|subscribers)\b/iu.test(value)
	)
}

describe('PROFILE', () => {
	test('keeps the approved work intro and weekly strip legend', () => {
		expect(PROFILE.work).toStrictEqual({
			intro: 'My own product first, then my jobs, newest first.',
			weeklyStripLegend:
				'One square is one week of my GitHub and GitLab contributions.',
		})
	})

	test('keeps the approved Ludus AI role, period, description and group counts', () => {
		const job = PROFILE.jobs.find(candidate => candidate.company === 'Ludus AI')

		assert(job !== undefined)
		expect({
			...job,
			groups: job.groups.map(({ title, items }) => ({
				title,
				itemCount: items.length,
			})),
		}).toStrictEqual({
			company: 'Ludus AI',
			role: 'Fullstack Developer',
			period: { start: '2025-06' },
			description:
				'Ludus AI is an AI assistant for Unreal Engine, used by 30,000+ developers. I own its web platform and a large part of its infrastructure and security.',
			groups: [
				{ title: 'Product', itemCount: 8 },
				{ title: 'Security and compliance', itemCount: 4 },
				{ title: 'Infrastructure', itemCount: 4 },
				{ title: 'Code quality', itemCount: 2 },
			],
		})
	})

	test('keeps jobs and their periods newest first', () => {
		expect(
			PROFILE.jobs.map(({ company, period }) => ({ company, period }))
		).toStrictEqual([
			{ company: 'Ludus AI', period: { start: '2025-06' } },
			{ company: 'Blazity', period: { start: '2024-10', end: '2025-05' } },
			{ company: 'Tenset', period: { start: '2021-08', end: '2024-03' } },
		])
	})

	test('places the mobile app stack after Tailwind CSS in Front end', () => {
		const frontEnd = PROFILE.stack.find(group => group.title === 'Front end')

		assert(frontEnd !== undefined)
		const tailwindIndex = frontEnd.entries.findIndex(
			entry => entry.technology === 'Tailwind CSS'
		)

		expect(tailwindIndex).toBeGreaterThanOrEqual(0)
		expect(frontEnd.entries[tailwindIndex + 1]).toStrictEqual({
			technology: 'React Native, Expo',
			usedAt: ['rigtch.fm mobile app'],
		})
	})

	test('excludes forbidden punctuation from every string', () => {
		const forbidden = [...stringsIn(PROFILE)].filter(value =>
			/[\u2013\u2014]/u.test(value)
		)

		expect(forbidden).toStrictEqual([])
	})

	test('excludes private contact, education, revenue and subscriber details from every string', () => {
		expect([...stringsIn(PROFILE)].filter(hasPrivateDetails)).toStrictEqual([])
	})

	test.each([
		'Contact person@example.com',
		'Phone: +48 123 456 789',
		'Phone: (212) 555-0123',
		'Phone: 123456789',
		'University education',
		'A degree in computing',
		'Completed studies',
		'Attended school',
		'Annual revenue',
		'MRR: 100',
		'ARR: 1200',
		'Monthly income',
		'100 subscribers',
		'Phone: 555-0123',
		'Education: BSc Computer Science',
	])('detects private details in %s', value => {
		expect(hasPrivateDetails(value)).toBe(true)
	})

	test.each([
		'sign-up with email confirmation',
		'Next.js and tRPC until 02.2026',
		'73,000 listeners and 362M plays stored',
		'paid plan since 2026-03',
		'checked on 2026-11-25',
		'rigtch.fm mobile app',
	])('allows approved public wording in %s', value => {
		expect(hasPrivateDetails(value)).toBe(false)
	})

	test('keeps the approved Casual Fitters project description', () => {
		const project = PROFILE.jobs
			.find(job => job.company === 'Blazity')
			?.groups.flatMap(group => group.items)
			.find(item => item.title === 'Casual Fitters')

		expect(project?.text).toBe(
			'A London tailoring brand. Online store with a suit customiser and appointment booking. Joined near the end of a late project to help finish it, completing the remaining work, fixing earlier bugs and releasing the store.'
		)
	})

	test('gives every product and open source fact a source and checked date', () => {
		const facts = [
			...PROFILE.product.facts,
			...PROFILE.openSource.projects.map(project => project.fact),
		]

		expect(facts).toHaveLength(7)
		for (const fact of facts) {
			expect(fact.source.trim().length).toBeGreaterThan(0)
			expect(fact.checkedOn).toBe('2026-11-25')
		}
	})

	test('uses public https sources for every open source fact', () => {
		for (const project of PROFILE.openSource.projects) {
			expect(project.fact.source).toMatch(/^https:\/\//u)
		}
	})

	test('keeps the product facts in their display order', () => {
		expect(
			PROFILE.product.facts.map(({ value, label }) => ({ value, label }))
		).toStrictEqual([
			{ value: 73_000, label: 'listeners' },
			{ value: 362_000_000, label: 'plays stored' },
			{ value: '2026-03', label: 'paid plan live' },
		])
	})

	test('keeps the open source projects and their fact values in order', () => {
		expect(
			PROFILE.openSource.projects.map(({ name, fact }) => ({
				name,
				value: fact.value,
				label: fact.label,
			}))
		).toStrictEqual([
			{ name: 'T3 Code', value: 43, label: 'merged pull requests' },
			{ name: 'oRPC', value: 5, label: 'merged pull requests' },
			{ name: 'posthog-js', value: 1, label: 'merged pull request' },
			{ name: 'platform-hono', value: 5400, label: 'npm downloads a month' },
		])
	})

	test.each([
		['PostgreSQL', 0, 'rigtch.fm with 362M plays'],
		['BullMQ', 1, '17 queues'],
		['oxlint', 0, 'rigtch.fm with 13 rules of my own'],
		['Next.js', 1, 'rigtch.fm until 02.2026'],
		['tRPC', 0, 'rigtch.fm until 02.2026'],
	] as const)(
		'renders the sourced fact for %s',
		(technology, index, expected) => {
			const entry = PROFILE.stack
				.flatMap(group => group.entries)
				.find(candidate => candidate.technology === technology)

			expect(entry?.usedAt[index]).toBe(expected)
		}
	)

	test.each([
		['NestJS', ['rigtch.fm', 'Tenset']],
		['Hono', ['rigtch.fm', 'platform-hono']],
		['Node.js', ['every job and project']],
		['Bun', ['rigtch.fm']],
		['BullMQ', ['rigtch.fm', '17 queues']],
		['Redis', ['rigtch.fm', 'Ludus AI']],
		['oRPC', ['rigtch.fm', 'contributor']],
		['OAuth', ['Ludus AI', 'rigtch.fm', 'Blazity']],
		['Prisma', ['Ludus AI and rigtch.fm before Drizzle', 'Blazity']],
		['Vercel', ['rigtch.fm web until 02.2026', 'Blazity']],
		[
			'Vitest, Playwright, Testing Library',
			['rigtch.fm', 'Ludus AI', 'Blazity'],
		],
		['Claude Code, Codex, T3 Code', ['every day', 'side by side']],
		['Strapi', ['own projects', 'Tenset']],
	] as const)('keeps one approved stack row for %s', (technology, usedAt) => {
		expect(
			PROFILE.stack
				.flatMap(group => group.entries)
				.filter(entry => entry.technology === technology)
				.map(entry => entry.usedAt)
		).toStrictEqual([usedAt])
	})

	test('keeps profile links in the approved order', () => {
		expect(PROFILE.links).toStrictEqual([
			{ label: 'GitHub', url: 'https://github.com/Mnigos' },
			{ label: 'X', url: 'https://x.com/mnigos0' },
			{
				label: 'LinkedIn',
				url: 'https://www.linkedin.com/in/igor-makowski-b30684206/',
			},
			{ label: 'RSS', url: '/rss.xml' },
		])
	})
})
