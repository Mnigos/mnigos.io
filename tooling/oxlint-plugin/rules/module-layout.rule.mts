import { defineRule } from '@oxlint/plugins'
import {
	getModulePath,
	isModuleLayer,
	MODULE_LAYERS,
	toFilePath,
} from '../helpers/file-role.helper.mts'

const MODULE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const LAYER_LIST = MODULE_LAYERS.map(layer => `${layer}/`).join(', ')

/** Keeps `src/modules/<module>/` kebab-case and every file inside one of its layer folders. */
export const moduleLayoutRule = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Module folders are kebab-case and hold files only inside layer folders.',
		},
		messages: {
			moduleName:
				'Name the module folder {{module}} in kebab-case (AGENTS.md boundaries).',
			outsideLayer: `Move this file into one of the layer folders of modules/{{module}}: ${LAYER_LIST} (AGENTS.md boundaries).`,
		},
	},
	create(context) {
		const modulePath = getModulePath(toFilePath(context.filename))

		return {
			Program(node) {
				if (!modulePath) return

				const { module, folder } = modulePath

				if (!MODULE_NAME_PATTERN.test(module))
					context.report({ node, messageId: 'moduleName', data: { module } })

				if (!isModuleLayer(folder))
					context.report({ node, messageId: 'outsideLayer', data: { module } })
			},
		}
	},
})
