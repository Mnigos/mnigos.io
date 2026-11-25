import { describe, expect, test } from 'vitest'
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

describe('PROFILE', () => {
	test('keeps the approved work intro and weekly strip legend', () => {
		expect(PROFILE.work).toStrictEqual({
			intro: 'My own product first, then the jobs, newest first.',
			weeklyStripLegend:
				'One square is one week of my GitHub and GitLab contributions.',
		})
	})

	test('limits the Ludus AI job to the approved public fields', () => {
		expect(PROFILE.jobs.find(job => job.company === 'Ludus AI')).toStrictEqual({
			company: 'Ludus AI',
			role: 'Fullstack Developer',
			period: { start: '2025-06' },
			description:
				'Ludus AI is an AI assistant for Unreal Engine, used by 30,000+ developers.',
			groups: [],
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

	test('mentions Ludus only as a bare place in the stack', () => {
		const places = PROFILE.stack
			.flatMap(group => group.entries.flatMap(entry => entry.usedAt))
			.filter(place => place.includes('Ludus'))

		expect(places.length).toBeGreaterThan(0)
		for (const place of places) expect(place).toBe('Ludus AI')
	})

	test('excludes forbidden punctuation and mobile technologies from every string', () => {
		const forbidden = [...stringsIn(PROFILE)].filter(value =>
			/[\u2013\u2014]|React Native|Expo/u.test(value)
		)

		expect(forbidden).toEqual([])
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
		['BullMQ, Redis', 1, '17 queues'],
		['oxlint', 0, 'rigtch.fm with 13 rules of my own'],
		['oRPC', 1, '5 merged pull requests'],
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
