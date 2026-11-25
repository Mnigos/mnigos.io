import { describe, expect, it } from 'vitest'
import { describeTokenExpiration } from './token-expiration.helper'

const now = new Date('2026-12-01T00:00:00.000Z')

describe('describeTokenExpiration', () => {
	it.each([
		{
			expiration: undefined,
			message: 'RIGTCH_REPO_TOKEN never expires',
			warn: false,
		},
		{
			expiration: 'not-a-date',
			message: 'RIGTCH_REPO_TOKEN expiration is unreadable: not-a-date',
			warn: true,
		},
		{
			expiration: '2026-12-14 00:00:00 UTC',
			message:
				'RIGTCH_REPO_TOKEN expires on 2026-12-14 00:00:00 UTC, in 13 days, rotate it as docs/deploy.md describes',
			warn: true,
		},
		{
			expiration: '2026-12-25 00:00:00 UTC',
			message:
				'RIGTCH_REPO_TOKEN expires on 2026-12-25 00:00:00 UTC, in 24 days',
			warn: false,
		},
	])(
		'names RIGTCH_REPO_TOKEN for expiration $expiration',
		({ expiration, message, warn }) => {
			expect(
				describeTokenExpiration('RIGTCH_REPO_TOKEN', expiration, now)
			).toEqual({ message, warn })
		}
	)

	it.each([
		{ expiration: '2026-12-14 00:00:00 UTC', days: 13, warn: true },
		{ expiration: '2026-12-15 00:00:00 UTC', days: 14, warn: false },
		{ expiration: '2026-12-16 00:00:00 UTC', days: 15, warn: false },
		{ expiration: '2026-12-14 23:59:59 UTC', days: 13, warn: true },
		{ expiration: '2026-12-01 00:00:00 UTC', days: 0, warn: true },
		{ expiration: '2026-11-30 23:59:59 UTC', days: -1, warn: true },
		{ expiration: '2026-11-29 00:00:00 UTC', days: -2, warn: true },
		{ expiration: '2026-12-15 02:00:00 +0200', days: 14, warn: false },
		{ expiration: '2026-12-15 01:59:59 +0200', days: 13, warn: true },
		{ expiration: '2026-12-14 19:00:00 -0500', days: 14, warn: false },
		{ expiration: '2026-12-14 18:59:59 -0500', days: 13, warn: true },
	])(
		'describes $expiration as $days full days left with warn=$warn',
		({ expiration, days, warn }) => {
			expect(
				describeTokenExpiration('GH_CONTRIBUTIONS_TOKEN', expiration, now)
			).toEqual({
				message: `GH_CONTRIBUTIONS_TOKEN expires on ${expiration}, in ${days} days${warn ? ', rotate it as docs/deploy.md describes' : ''}`,
				warn,
			})
		}
	)

	it('does not warn for an absent expiration header', () => {
		expect(
			describeTokenExpiration('GH_CONTRIBUTIONS_TOKEN', undefined, now)
		).toEqual({
			message: 'GH_CONTRIBUTIONS_TOKEN never expires',
			warn: false,
		})
	})

	it.each([
		'',
		'not-a-date',
		'2026-13-25 00:00:00 UTC',
		'2026-12-25 25:00:00 UTC',
		'2026-12-25 00:00:00 +2460',
	])('warns and echoes the unreadable header %j', expiration => {
		expect(
			describeTokenExpiration('GH_CONTRIBUTIONS_TOKEN', expiration, now)
		).toEqual({
			message: `GH_CONTRIBUTIONS_TOKEN expiration is unreadable: ${expiration}`,
			warn: true,
		})
	})
})
