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

	it('returns the four approved rows and item lists for the real Ludus AI job', () => {
		const job = PROFILE.jobs.find(candidate => candidate.company === 'Ludus AI')

		assert(job !== undefined)
		expect(getJobGroupRows(job.groups)).toStrictEqual([
			{
				term: 'Product',
				items: [
					'Account web app, landing page and the web UI of the Unreal Engine plugin',
					'Took over a full rewrite of the web app and shipped it to production',
					'Took ownership of Stripe billing and made it reliable',
					'Custom OAuth authorization that connects user accounts with the Unreal Engine plugin and AI integrations',
					'LudusMCP, an integration layer that connects Ludus AI with external AI agents',
					'Trial abuse detection with automatic containment and alerts',
					'Admin views for support workflows',
					'Product analytics on PostHog, Google Tag Manager events and server-side conversion tracking for ad platforms',
				],
			},
			{
				term: 'Security and compliance',
				items: [
					'Led the security work for ISO 27001 and SOC 2 Type 2',
					'Vulnerability management for code, dependencies, Docker images and cloud configuration',
					'Strict Content Security Policy and unified security headers',
					'GDPR: account erasure across web and API, consent handling, data retention',
				],
			},
			{
				term: 'Infrastructure',
				items: [
					'Cloudflare: Workers, WAF, Zero Trust, DNS and email security',
					'Google Cloud: load balancer configuration, Cloud Armor rules, alerting on permission and audit-log changes',
					'Release management, CI pipelines and automatic database migrations',
					'Observability: telemetry pipeline, Sentry triage and production alerts',
				],
			},
			{
				term: 'Code quality',
				items: [
					'Introduced lint rules and coding standards that raised code quality across the web repository',
					'Migrated the web projects into a monorepo, speeding up development',
				],
			},
		])
	})
})
