import { assert, describe, expect, it } from 'vitest'
import { PROFILE } from '../../profile/content/profile.content'
import { getJobGroupRows } from './job-groups.helper'

describe('getJobGroupRows', () => {
	it('makes one row of item texts for a titled group', () => {
		expect(
			getJobGroupRows([
				{
					title: 'Projects',
					items: [
						{ title: 'First project', text: 'First description' },
						{ text: 'Second description' },
					],
				},
			])
		).toStrictEqual([
			{ term: 'Projects', items: ['First description', 'Second description'] },
		])
	})

	it('makes one row per titled item in an untitled group', () => {
		expect(
			getJobGroupRows([
				{
					items: [
						{ title: 'First project', text: 'First description' },
						{ title: 'Second project', text: 'Second description' },
					],
				},
			])
		).toStrictEqual([
			{ term: 'First project', text: 'First description' },
			{ term: 'Second project', text: 'Second description' },
		])
	})

	it('uses an empty term for an untitled item in an untitled group', () => {
		expect(
			getJobGroupRows([{ items: [{ text: 'Description without a title' }] }])
		).toStrictEqual([{ term: '', text: 'Description without a title' }])
	})

	it('preserves group and item order across mixed groups', () => {
		expect(
			getJobGroupRows([
				{ title: 'First group', items: [{ text: 'First description' }] },
				{
					items: [
						{ title: 'First item', text: 'Second description' },
						{ text: 'Third description' },
					],
				},
				{ title: 'Last group', items: [{ text: 'Last description' }] },
			])
		).toStrictEqual([
			{ term: 'First group', items: ['First description'] },
			{ term: 'First item', text: 'Second description' },
			{ term: '', text: 'Third description' },
			{ term: 'Last group', items: ['Last description'] },
		])
	})

	it('returns no rows for an empty list', () => {
		expect(getJobGroupRows([])).toStrictEqual([])
	})

	it('returns no rows for the real Ludus AI job', () => {
		const job = PROFILE.jobs.find(candidate => candidate.company === 'Ludus AI')

		assert(job !== undefined)
		expect(getJobGroupRows(job.groups)).toStrictEqual([])
	})
})
