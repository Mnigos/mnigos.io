import { definePlugin } from '@oxlint/plugins'
import { declarationGroupSpacingRule } from './rules/declaration-group-spacing.rule.mts'
import { declarationJsdocRule } from './rules/declaration-jsdoc.rule.mts'
import { fileRoleFolderRule } from './rules/file-role-folder.rule.mts'
import { fileRoleSuffixRule } from './rules/file-role-suffix.rule.mts'
import { moduleLayoutRule } from './rules/module-layout.rule.mts'
import { noInlineParamTypeRule } from './rules/no-inline-param-type.rule.mts'
import { noLetRule } from './rules/no-let.rule.mts'
import { typeParamPrefixRule } from './rules/type-param-prefix.rule.mts'

export default definePlugin({
	meta: { name: 'mnigos' },
	rules: {
		'declaration-group-spacing': declarationGroupSpacingRule,
		'declaration-jsdoc': declarationJsdocRule,
		'file-role-folder': fileRoleFolderRule,
		'file-role-suffix': fileRoleSuffixRule,
		'module-layout': moduleLayoutRule,
		'no-inline-param-type': noInlineParamTypeRule,
		'no-let': noLetRule,
		'type-param-prefix': typeParamPrefixRule,
	},
})
