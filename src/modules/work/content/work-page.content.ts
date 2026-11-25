import { PROFILE } from '../../profile/content/profile.content'

const { name, product, jobs } = PROFILE

export const WORK_PAGE = {
	title: 'Work · mnigos',
	description: `Work by ${name}: ${[product.name, ...jobs.map(({ company }) => company)].join(', ')}.`,
	heading: 'Work',
	productPageLink: `More about ${product.name}`,
} as const
