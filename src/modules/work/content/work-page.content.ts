import { PROFILE } from '../../profile/content/profile.content'

const { name, product, jobs } = PROFILE

export const WORK_PAGE = {
	title: 'Work · mnigos',
	description: `${name}: ${[product.name, ...jobs.map(({ company }) => company)].join(', ')}`,
	heading: 'Work',
} as const
