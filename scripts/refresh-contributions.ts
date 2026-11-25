import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
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

const years = await fetchContributionYears(token)
const yearLines = years.map(year => `    ${JSON.stringify(year)}`)

await writeFile(
	SNAPSHOT_PATH,
	`{\n  "generatedAt": "${new Date().toISOString()}",\n  "years": [\n${yearLines.join(',\n')}\n  ]\n}\n`
)

for (const { year, total } of years) console.info(`${year}: ${total}`)
