import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

export const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	publishedAt: z.coerce.date(),
	tags: z.array(z.string()).default([]),
	draft: z.boolean().default(false),
})

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: blogSchema,
})

export const collections = { blog }
