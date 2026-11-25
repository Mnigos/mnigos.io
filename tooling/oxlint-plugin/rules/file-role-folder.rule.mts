import { defineRule } from '@oxlint/plugins'
import {
	getModulePath,
	getRoleSuffixes,
	type ModuleLayer,
	type RoleSuffix,
	toFilePath,
} from '../helpers/file-role.helper.mts'

const ROLE_FOLDERS = {
	client: ['infrastructure'],
	content: ['content'],
	handler: ['presentation'],
	mapper: ['infrastructure'],
	query: ['infrastructure'],
	repository: ['infrastructure'],
	snapshot: ['infrastructure'],
} as const satisfies Partial<Record<RoleSuffix, readonly ModuleLayer[]>>

type FolderBoundRole = keyof typeof ROLE_FOLDERS

function isFolderBoundRole(role: string): role is FolderBoundRole {
	return Object.hasOwn(ROLE_FOLDERS, role)
}

/** Reports a role-suffixed file outside the module layer that owns the role; both roles of a two-role name count. */
export const fileRoleFolderRule = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Role-suffixed files live in the layer that owns the role.',
		},
		messages: {
			wrongFolder:
				'A .{{role}}.ts file belongs in a module {{folders}} folder (AGENTS.md naming table).',
		},
	},
	create(context) {
		const file = toFilePath(context.filename)
		const folder = getModulePath(file)?.folder
		const roles = getRoleSuffixes(file).filter(isFolderBoundRole)

		return {
			Program(node) {
				for (const role of roles) {
					const folders: readonly string[] = ROLE_FOLDERS[role]

					if (folder && folders.includes(folder)) continue

					context.report({
						node,
						messageId: 'wrongFolder',
						data: {
							role,
							folders: folders.map(name => `${name}/`).join(' or '),
						},
					})
				}
			},
		}
	},
})
