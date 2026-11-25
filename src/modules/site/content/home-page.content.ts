import { PROFILE } from '../../profile/content/profile.content'

export const HOME_PAGE = {
	title: `${PROFILE.name} · mnigos`,
	description: 'Software engineer building for the web. Portfolio and blog.',
	contributions: {
		label: 'GitHub contributions by year, with the job I held at the time',
		less: 'Less',
		more: 'More',
		note: 'GitHub contributions per day, same scale for every year',
	},
	openSource: { heading: 'Open source' },
	blog: { heading: 'Blog', allPosts: 'All posts' },
} as const
