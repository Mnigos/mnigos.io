import type { Job } from '../../profile/domain/profile.schemas'

export type JobGroupRow =
	| { term: string; text: string }
	| { term: string; items: string[] }

export function getJobGroupRows(groups: Job['groups']) {
	return groups.flatMap<JobGroupRow>(({ title, items }) =>
		title === undefined
			? items.map(item => ({ term: item.title ?? '', text: item.text }))
			: [{ term: title, items: items.map(({ text }) => text) }]
	)
}
