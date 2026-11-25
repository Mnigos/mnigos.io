import { join } from 'node:path'
import { getCommitYears } from '../src/modules/contributions/domain/commit-days.helper'
import { describeTokenExpiration } from '../src/modules/contributions/domain/token-expiration.helper'
import {
	writeCommitDaysSnapshot,
	writeContributionSnapshot,
} from '../src/modules/contributions/infrastructure/contributions-snapshot.repository'
import { fetchContributionYears } from '../src/modules/contributions/infrastructure/contributions.client'
import { env } from '../src/modules/contributions/infrastructure/contributions.config'
import {
	fetchRigtchFmCommitDays,
	RigtchFmResponseError,
} from '../src/modules/contributions/infrastructure/rigtch-fm-commits.client'

interface Annotation {
	message: string
	warn: boolean
}

const INFRASTRUCTURE_PATH = '../src/modules/contributions/infrastructure'
const SNAPSHOT_PATH = join(
	import.meta.dirname,
	INFRASTRUCTURE_PATH,
	'contributions.snapshot.json'
)
const RIGTCH_FM_SNAPSHOT_PATH = join(
	import.meta.dirname,
	INFRASTRUCTURE_PATH,
	'rigtch-fm-commits.snapshot.json'
)
const RIGTCH_REPO_TOKEN_HELP =
	'the rigtch.fm commit snapshot keeps its last numbers. Replace the repository secret RIGTCH_REPO_TOKEN with a fine-grained token with Contents read on Rigtch/rigtch.fm: `gh secret set RIGTCH_REPO_TOKEN --repo Mnigos/mnigos.io`, then rerun the workflow (docs/deploy.md)'

/** GitHub Actions turns a `::warning::` line into an annotation on the run summary. */
function annotate({ message, warn }: Annotation) {
	console.info(warn ? `::warning::${message}` : message)
}

async function refreshRigtchFmCommits(token: string | undefined) {
	if (!token) {
		annotate({
			message: `RIGTCH_REPO_TOKEN is not set, ${RIGTCH_REPO_TOKEN_HELP}`,
			warn: true,
		})
		return
	}

	try {
		const { days, tokenExpiration } = await fetchRigtchFmCommitDays(token)
		const written = await writeCommitDaysSnapshot(
			RIGTCH_FM_SNAPSHOT_PATH,
			days,
			new Date()
		)

		for (const { year, total } of getCommitYears([days]))
			console.info(`rigtch.fm ${year}: ${total}`)
		console.info(
			written
				? 'rigtch.fm commit snapshot updated'
				: 'rigtch.fm commit snapshot unchanged'
		)
		annotate(
			describeTokenExpiration('RIGTCH_REPO_TOKEN', tokenExpiration, new Date())
		)
	} catch (error) {
		const reason =
			error instanceof RigtchFmResponseError
				? `GitHub answered ${error.message}`
				: 'the refresh failed'

		annotate({
			message: `rigtch.fm commits: ${reason}, ${RIGTCH_REPO_TOKEN_HELP}`,
			warn: true,
		})
	}
}

const token = env.GH_CONTRIBUTIONS_TOKEN

if (!token)
	throw new Error(
		'GH_CONTRIBUTIONS_TOKEN must be set: GH_CONTRIBUTIONS_TOKEN=$(gh auth token) bun <this script>'
	)

const { years, tokenExpiration } = await fetchContributionYears(token)
const written = await writeContributionSnapshot(
	SNAPSHOT_PATH,
	years,
	new Date()
)

for (const { year, total } of years) console.info(`${year}: ${total}`)
console.info(written ? 'Snapshot updated' : 'Snapshot unchanged')
annotate(
	describeTokenExpiration('GH_CONTRIBUTIONS_TOKEN', tokenExpiration, new Date())
)
await refreshRigtchFmCommits(env.RIGTCH_REPO_TOKEN)
