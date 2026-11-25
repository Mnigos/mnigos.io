import { z } from 'zod'

const textSchema = z.string().min(1)
const linkSchema = z.object({ label: textSchema, url: z.url() })

const factFields = {
	label: textSchema,
	/** An `https://` URL for public data, a short description for private rigtch.fm data. */
	source: textSchema,
	checkedOn: z.iso.date(),
}

const jobGroupSchema = z.object({
	title: textSchema.optional(),
	items: z.array(z.object({ title: textSchema.optional(), text: textSchema })),
})

export const monthSchema = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/u)
export type Month = z.infer<typeof monthSchema>

export const numberFactSchema = z.object({
	value: z.int().min(0),
	...factFields,
})
export type NumberFact = z.infer<typeof numberFactSchema>

export const monthFactSchema = z.object({ value: monthSchema, ...factFields })
export type MonthFact = z.infer<typeof monthFactSchema>

export const productSchema = z.object({
	name: textSchema,
	url: z.url(),
	kind: textSchema,
	tagline: textSchema,
	summary: textSchema,
	whatIDo: textSchema,
	stack: textSchema,
	facts: z.array(z.union([numberFactSchema, monthFactSchema])),
})
export type Product = z.infer<typeof productSchema>

/** `period.end` is absent while the job is current. */
export const jobSchema = z.object({
	company: textSchema,
	url: z.url().optional(),
	role: textSchema,
	period: z
		.object({ start: monthSchema, end: monthSchema.optional() })
		.refine(
			({ start, end }) => end === undefined || start <= end,
			'A period cannot end before it starts'
		),
	description: textSchema,
	groups: z.array(jobGroupSchema),
})
export type Job = z.infer<typeof jobSchema>

export const openSourceProjectSchema = z.object({
	name: textSchema,
	note: textSchema.optional(),
	url: z.url(),
	fact: numberFactSchema,
})
export type OpenSourceProject = z.infer<typeof openSourceProjectSchema>

/** The page joins `usedAt` with ", ". */
export const stackGroupSchema = z.object({
	title: textSchema,
	entries: z.array(
		z.object({ technology: textSchema, usedAt: z.array(textSchema).min(1) })
	),
})
export type StackGroup = z.infer<typeof stackGroupSchema>

/** Jobs are newest first, so only the first one can still be current. */
export const profileSchema = z.object({
	name: textSchema,
	intro: textSchema,
	links: z.array(
		linkSchema.extend({
			url: z.union([
				z.url({ protocol: /^https$/u }),
				z.string().regex(/^\/(?![/\\])/u),
			]),
		})
	),
	product: productSchema,
	jobs: z
		.array(jobSchema)
		.refine(
			jobs => jobs.slice(1).every(job => job.period.end !== undefined),
			'Only the first job can be current'
		),
	openSource: z.object({
		link: linkSchema,
		projects: z.array(openSourceProjectSchema),
	}),
	stack: z.array(stackGroupSchema),
})
export type Profile = z.infer<typeof profileSchema>
