import { z } from 'zod'
import { pathSchema, textSchema } from '../../profile/domain/profile.schemas'

const linkedTextSchema = z
	.object({
		text: textSchema,
		link: z.object({ label: textSchema, url: pathSchema }).optional(),
	})
	.refine(
		({ text, link }) => !link || text.split(link.label).length === 2,
		'A link label appears exactly once in its text'
	)
export type LinkedText = z.infer<typeof linkedTextSchema>

const namesSchema = z.union([
	textSchema.transform(name => [name]),
	z.array(textSchema).min(1),
])

/** A list of names is one family, "TanStack Start, Router and Query"; `on` holds what it runs on. */
const labelItemSchema = z.union([
	namesSchema.transform(names => ({ names, on: [] })),
	z.object({ names: namesSchema, on: z.array(textSchema).min(1) }),
])

const labelRowSchema = z.object({
	label: textSchema,
	items: z.array(labelItemSchema).min(1),
	note: textSchema.optional(),
})

const toolEntrySchema = linkedTextSchema.extend({
	tools: z
		.array(
			z.object({
				name: textSchema,
				url: z.url({ protocol: /^https$/u }).optional(),
			})
		)
		.min(1),
	note: textSchema.optional(),
})

const labelSectionSchema = z.object({
	heading: textSchema,
	intro: linkedTextSchema.optional(),
	rows: z.array(labelRowSchema).min(1),
})

const toolSectionSchema = z.object({
	heading: textSchema,
	entries: z.array(toolEntrySchema).min(1),
})

/** Every name in `defaults`, `on` included, is a technology that can be checked against the Stack table on /work. */
export const usesPageSchema = z.object({
	title: textSchema,
	description: textSchema,
	heading: textSchema,
	lede: textSchema,
	defaults: labelSectionSchema,
	agents: toolSectionSchema,
	desk: toolSectionSchema,
	gamingPc: labelSectionSchema,
	music: toolSectionSchema,
})
