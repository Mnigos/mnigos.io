import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RigtchFmResponseError } from '../src/modules/contributions/infrastructure/rigtch-fm-commits.client'

const token = 'test-rigtch-refresh-token'
const privateMessage = `private response https://example.test/private?token=${token}`
const years = [{ year: 2025, total: 3, counts: [3] }]
const fetchGitHub = vi
	.fn()
	.mockResolvedValue({ years, tokenExpiration: undefined })
const fetchCommits = vi.fn()
const writeGitHub = vi.fn().mockResolvedValue(false)
const writeCommits = vi.fn().mockResolvedValue(false)
const request = vi.fn<typeof fetch>()

async function refreshWithToken(value: string | undefined) {
	vi.doMock(
		'../src/modules/contributions/infrastructure/contributions.config',
		() => ({
			env: {
				GH_CONTRIBUTIONS_TOKEN: 'test-github-refresh-token',
				RIGTCH_REPO_TOKEN: value,
			},
		})
	)
	await import('./refresh-contributions')
}

function expectIsolatedFailure(status?: number) {
	expect(fetchGitHub).toHaveBeenCalledTimes(1)
	expect(writeGitHub).toHaveBeenCalledTimes(1)
	expect(writeGitHub).toHaveBeenCalledWith(
		expect.stringContaining('contributions.snapshot.json'),
		years,
		expect.any(Date)
	)
	expect(writeCommits).not.toHaveBeenCalled()
	expect(request).not.toHaveBeenCalled()
	const lines = vi.mocked(console.info).mock.calls.map(([line]) => String(line))
	const warnings = lines.filter(line => line.startsWith('::warning::'))
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toContain('RIGTCH_REPO_TOKEN')
	expect(warnings[0]).toContain(
		'gh secret set RIGTCH_REPO_TOKEN --repo Mnigos/mnigos.io'
	)
	expect(warnings[0]).toContain('docs/deploy.md')
	if (status !== undefined) expect(warnings[0]).toContain(`HTTP ${status}`)
	expect(lines).toContain('2025: 3')
	expect(lines).toContain('Snapshot unchanged')
	expect(lines.join('\n')).not.toContain(privateMessage)
	expect(lines.join('\n')).not.toContain(token)
	expect(lines.join('\n')).not.toContain('https://')
}

beforeEach(() => {
	vi.resetModules()
	vi.clearAllMocks()
	request.mockRejectedValue(new Error('Unexpected network request'))
	vi.stubGlobal('fetch', request)
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.doMock(
		'../src/modules/contributions/infrastructure/contributions.client',
		() => ({
			fetchContributionYears: fetchGitHub,
		})
	)
	vi.doMock(
		'../src/modules/contributions/infrastructure/rigtch-fm-commits.client',
		() => ({
			fetchRigtchFmCommitDays: fetchCommits,
			RigtchFmResponseError,
		})
	)
	vi.doMock(
		'../src/modules/contributions/infrastructure/contributions-snapshot.repository',
		() => ({
			writeContributionSnapshot: writeGitHub,
			writeCommitDaysSnapshot: writeCommits,
		})
	)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	vi.doUnmock(
		'../src/modules/contributions/infrastructure/contributions.config'
	)
	vi.doUnmock(
		'../src/modules/contributions/infrastructure/contributions.client'
	)
	vi.doUnmock(
		'../src/modules/contributions/infrastructure/rigtch-fm-commits.client'
	)
	vi.doUnmock(
		'../src/modules/contributions/infrastructure/contributions-snapshot.repository'
	)
})

describe('refresh-contributions rigtch.fm failure isolation', () => {
	it.each([undefined, ''])(
		'keeps the snapshot when RIGTCH_REPO_TOKEN is %s',
		async value => {
			await refreshWithToken(value)

			expect(fetchCommits).not.toHaveBeenCalled()
			expectIsolatedFailure()
		}
	)

	it.each([401, 403, 404, 500])(
		'keeps the snapshot and warns with only HTTP %i',
		async status => {
			fetchCommits.mockRejectedValueOnce(new RigtchFmResponseError(status))

			await refreshWithToken(token)

			expect(fetchCommits).toHaveBeenCalledWith(token)
			expectIsolatedFailure(status)
		}
	)

	it.each([new Error(privateMessage), privateMessage])(
		'keeps the snapshot without logging a thrown value %#',
		async failure => {
			fetchCommits.mockRejectedValueOnce(failure)

			await refreshWithToken(token)

			expect(fetchCommits).toHaveBeenCalledWith(token)
			expectIsolatedFailure()
		}
	)
})
