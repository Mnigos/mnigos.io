import { readFile, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import type { ContributionYear } from '../domain/contribution.types'

/** Keeps the file, `generatedAt` included, when the years are unchanged, so the daily refresh commits only new numbers. Returns whether it wrote. */
export async function writeContributionSnapshot(
	path: string,
	years: readonly ContributionYear[],
	now: Date
) {
	const current: unknown = JSON.parse(await readFile(path, 'utf-8'))

	if (
		typeof current === 'object' &&
		current !== null &&
		'years' in current &&
		isDeepStrictEqual(current.years, years)
	)
		return false

	const yearLines = years.map(year => `    ${JSON.stringify(year)}`)

	await writeFile(
		path,
		`{\n  "generatedAt": "${now.toISOString()}",\n  "years": [\n${yearLines.join(',\n')}\n  ]\n}\n`
	)
	return true
}
