import type {
	ContributionYear,
	GitLabEventCounts,
	GitLabEventDays,
} from './contribution.types'
import { getDayOfYear } from './iso-date.helper'

export function getGitLabContributionCount(events: GitLabEventCounts) {
	const [
		pushes,
		,
		mergeRequestsOpened,
		mergeRequestsMerged,
		approvals,
		issuesOpened,
		issuesClosed,
		comments,
		,
		other,
	] = events

	return (
		pushes +
		mergeRequestsOpened +
		mergeRequestsMerged +
		approvals +
		issuesOpened +
		issuesClosed +
		comments +
		other
	)
}

/** Adds each GitLab day to the GitHub count on the same date and raises that year's total by the same amount. */
export function addGitLabContributions(
	years: readonly ContributionYear[],
	gitLabDays: GitLabEventDays
): ContributionYear[] {
	const gitLabEntries = Object.entries(gitLabDays)

	return years.map(({ year, total, counts }) => {
		const added = gitLabEntries
			.filter(([date]) => date.startsWith(`${year}-`))
			.map(
				([date, events]) =>
					[getDayOfYear(date), getGitLabContributionCount(events)] as const
			)
		const merged = [...counts]

		for (const [dayOfYear, count] of added) merged[dayOfYear] += count

		return {
			year,
			total: added.reduce((sum, [, count]) => sum + count, total),
			counts: merged,
		}
	})
}
