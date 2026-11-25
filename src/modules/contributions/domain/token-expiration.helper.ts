import { DAY_MS } from './iso-date.helper'

const EXPIRATION_PATTERN =
	/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) (?:UTC|([+-]\d{2})(\d{2}))$/u
const WARNING_DAYS = 14

/** `expiration` is the `github-authentication-token-expiration` header, such as `2026-12-25 00:00:00 UTC` or with a `+0200` offset, absent for tokens that never expire. */
export function describeTokenExpiration(
	expiration: string | undefined,
	now: Date
) {
	if (expiration === undefined)
		return { message: 'GH_CONTRIBUTIONS_TOKEN never expires', warn: false }

	const match = EXPIRATION_PATTERN.exec(expiration)
	const zone = match?.[3] ? `${match[3]}:${match[4]}` : 'Z'
	const expiresAt = match
		? Date.parse(`${match[1]}T${match[2]}${zone}`)
		: Number.NaN

	if (Number.isNaN(expiresAt))
		return {
			message: `GH_CONTRIBUTIONS_TOKEN expiration is unreadable: ${expiration}`,
			warn: true,
		}

	const daysLeft = Math.floor((expiresAt - now.getTime()) / DAY_MS)
	const warn = daysLeft < WARNING_DAYS

	return {
		message: `GH_CONTRIBUTIONS_TOKEN expires on ${expiration}, in ${daysLeft} days${warn ? ', rotate it as docs/deploy.md describes' : ''}`,
		warn,
	}
}
