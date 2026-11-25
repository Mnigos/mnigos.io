import { defineRule } from '@oxlint/plugins'
import {
	type FilePath,
	getRoleSuffix,
	hasSegment,
	ROLE_SUFFIXES,
	toFilePath,
} from '../helpers/file-role.helper.mts'

/** Astro names route files after their URL; scripts/check-files.ts checks `.astro` names, because oxlint skips components without frontmatter. */
function isIgnored(file: FilePath) {
	return hasSegment(file, 'src/pages') || file.basename.endsWith('.astro')
}

/** Requires `<kebab-name>.<role>.ts` with a role from the closed AGENTS.md naming table. */
export const fileRoleSuffixRule = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Source files carry a role suffix from the closed AGENTS.md naming table.',
		},
		messages: {
			missingRoleSuffix: `Name the file <kebab-name>.<role>.ts (or <kebab-name>.<role>.<role>.ts) with roles from ${ROLE_SUFFIXES.join(', ')} (AGENTS.md naming table).`,
		},
	},
	create(context) {
		const file = toFilePath(context.filename)

		return {
			Program(node) {
				if (isIgnored(file) || getRoleSuffix(file) !== undefined) return

				context.report({ node, messageId: 'missingRoleSuffix' })
			},
		}
	},
})
