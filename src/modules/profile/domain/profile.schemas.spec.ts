import { describe, expect, test } from 'vitest'
import { PROFILE } from '../content/profile.content'
import { profileSchema, type Profile } from './profile.schemas'

describe('profileSchema', () => {
	test('accepts PROFILE', () => {
		expect(profileSchema.safeParse(PROFILE).success).toBe(true)
	})

	test('rejects a missing source', () => {
		const profile = structuredClone(PROFILE)
		Reflect.deleteProperty(profile.openSource.projects[0].fact, 'source')

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'openSource',
			'projects',
			0,
			'fact',
			'source',
		])
	})

	test('rejects an empty source', () => {
		const profile = structuredClone(PROFILE)
		profile.openSource.projects[0].fact.source = ''

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'openSource',
			'projects',
			0,
			'fact',
			'source',
		])
	})

	test.each([
		'',
		'not-a-date',
		'2026-11-5',
		'2026-02-29',
		'2026-04-31',
		'2026-11-25T00:00:00Z',
	])('rejects checkedOn %j as an invalid ISO date', checkedOn => {
		const profile = structuredClone(PROFILE)
		profile.openSource.projects[0].fact.checkedOn = checkedOn

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'openSource',
			'projects',
			0,
			'fact',
			'checkedOn',
		])
	})

	test.each(['2025-00', '2025-13', '2025-6'])('rejects job month %j', start => {
		const profile = structuredClone(PROFILE)
		profile.jobs[0].period.start = start

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'jobs',
			0,
			'period',
			'start',
		])
	})

	test('rejects a month fact outside 01 to 12', () => {
		const profile = structuredClone(PROFILE)
		profile.product.facts[2].value = '2026-13'

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.path.slice(0, 3)).toEqual([
			'product',
			'facts',
			2,
		])
	})

	test.each([1, 2])('rejects job %i ending before it starts', index => {
		const profile = structuredClone(PROFILE)
		profile.jobs[index].period.end = '2020-01'

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'jobs',
			index,
			'period',
		])
	})

	test.each([1, 2])('rejects non-first job %i without an end', index => {
		const profile = structuredClone(PROFILE)
		delete profile.jobs[index].period.end

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'jobs',
		])
	})

	test('rejects an empty usedAt array', () => {
		const profile = structuredClone(PROFILE)
		profile.stack[0].entries[0].usedAt = []

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'stack',
			0,
			'entries',
			0,
			'usedAt',
		])
	})

	test.each<{
		name: string
		mutate: (profile: Profile) => void
		path: (string | number)[]
	}>([
		{
			name: 'profile name',
			mutate: profile => {
				profile.name = ''
			},
			path: ['name'],
		},
		{
			name: 'job role',
			mutate: profile => {
				profile.jobs[0].role = ''
			},
			path: ['jobs', 0, 'role'],
		},
		{
			name: 'job item text',
			mutate: profile => {
				profile.jobs[1].groups[0].items[0].text = ''
			},
			path: ['jobs', 1, 'groups', 0, 'items', 0, 'text'],
		},
		{
			name: 'usedAt item',
			mutate: profile => {
				profile.stack[0].entries[0].usedAt[0] = ''
			},
			path: ['stack', 0, 'entries', 0, 'usedAt', 0],
		},
	])('rejects an empty $name', ({ mutate, path }) => {
		const profile = structuredClone(PROFILE)
		mutate(profile)

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual(path)
	})

	test.each([
		'http://github.com/Mnigos',
		'ftp://github.com/Mnigos',
		'//example.com',
		'/\\example.com',
		'rss.xml',
	])('rejects non-https or external profile link %j', url => {
		const profile = structuredClone(PROFILE)
		profile.links[0].url = url

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'links',
			0,
			'url',
		])
	})

	test('rejects a product url that is not a URL', () => {
		const profile = structuredClone(PROFILE)
		profile.product.url = 'rigtch.fm'

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'product',
			'url',
		])
	})

	test.each([-1, 1.5])('rejects number fact value %j', value => {
		const profile = structuredClone(PROFILE)
		profile.openSource.projects[0].fact.value = value

		const result = profileSchema.safeParse(profile)

		expect(result.success).toBe(false)
		expect(result.error?.issues.map(issue => issue.path)).toContainEqual([
			'openSource',
			'projects',
			0,
			'fact',
			'value',
		])
	})

	test('accepts zero as a number fact', () => {
		const profile = structuredClone(PROFILE)
		profile.openSource.projects[0].fact.value = 0

		expect(profileSchema.safeParse(profile).success).toBe(true)
	})

	test('accepts a real leap day', () => {
		const profile = structuredClone(PROFILE)
		profile.openSource.projects[0].fact.checkedOn = '2024-02-29'

		expect(profileSchema.safeParse(profile).success).toBe(true)
	})

	test('accepts a period ending in its starting month', () => {
		const profile = structuredClone(PROFILE)
		profile.jobs[1].period.end = profile.jobs[1].period.start

		expect(profileSchema.safeParse(profile).success).toBe(true)
	})
})
