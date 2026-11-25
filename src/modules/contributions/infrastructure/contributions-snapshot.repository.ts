import { readFile, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import type { CommitDays, ContributionYear } from '../domain/contribution.types'

/** Keeps the file, `generatedAt` included, when `value` equals the stored `key`, so the daily refresh commits only new numbers. Returns whether it wrote. */
async function writeSnapshot(
	path: string,
	key: string,
	value: unknown,
	json: string,
	now: Date
) {
	const current: unknown = JSON.parse(await readFile(path, 'utf-8'))

	if (
		typeof current === 'object' &&
		current !== null &&
		key in current &&
		isDeepStrictEqual(Reflect.get(current, key), value)
	)
		return false

	await writeFile(
		path,
		`{\n  "generatedAt": "${now.toISOString()}",\n  "${key}": ${json}\n}\n`
	)
	return true
}

export async function writeContributionSnapshot(
	path: string,
	years: readonly ContributionYear[],
	now: Date
) {
	const yearLines = years.map(year => `    ${JSON.stringify(year)}`)

	return await writeSnapshot(
		path,
		'years',
		years,
		`[\n${yearLines.join(',\n')}\n  ]`,
		now
	)
}

export async function writeCommitDaysSnapshot(
	path: string,
	days: CommitDays,
	now: Date
) {
	const dayLines = Object.entries(days).map(
		([date, count]) => `    "${date}": ${count}`
	)

	return await writeSnapshot(
		path,
		'days',
		days,
		`{\n${dayLines.join(',\n')}\n  }`,
		now
	)
}
