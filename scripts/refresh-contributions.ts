import { join } from 'node:path'
import { describeTokenExpiration } from '../src/modules/contributions/domain/token-expiration.helper'
import { writeContributionSnapshot } from '../src/modules/contributions/infrastructure/contributions-snapshot.repository'
import { fetchContributionYears } from '../src/modules/contributions/infrastructure/contributions.client'
import { env } from '../src/modules/contributions/infrastructure/contributions.config'

const SNAPSHOT_PATH = join(
	import.meta.dirname,
	'../src/modules/contributions/infrastructure/contributions.snapshot.json'
)
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
const expiration = describeTokenExpiration(tokenExpiration, new Date())

for (const { year, total } of years) console.info(`${year}: ${total}`)
console.info(written ? 'Snapshot updated' : 'Snapshot unchanged')
// GitHub Actions turns this line into an annotation on the run summary.
console.info(
	expiration.warn ? `::warning::${expiration.message}` : expiration.message
)
