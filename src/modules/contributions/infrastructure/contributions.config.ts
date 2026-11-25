import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/** Reads `process.env`, not `astro:env`, because the Bun refresh script cannot import Astro virtual modules. */
export const env = createEnv({
	server: { GH_CONTRIBUTIONS_TOKEN: z.string().optional() },
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
