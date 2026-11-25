import { relative } from 'node:path'
import { defineRule } from '@oxlint/plugins'
import {
	type FilePath,
	getModulePath,
	isModuleLayer,
	MODULE_LAYERS,
	toFilePath,
} from '../helpers/file-role.helper.mts'

const MODULE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const LAYER_LIST = MODULE_LAYERS.map(layer => `${layer}/`).join(', ')
const ASTRO_PLACED_FILES = new Set([
	'src/content.config.ts',
	'src/content.config.spec.ts',
])

/** Astro looks for these files at fixed paths, so they stay outside the modules. */
function isAstroPlaced({ path, basename }: FilePath) {
	return (
		ASTRO_PLACED_FILES.has(path) ||
		path.startsWith('src/pages/') ||
		basename.endsWith('.d.ts')
	)
}

/** Keeps every file under `src/` inside a layer folder of a kebab-case `src/modules/<module>/`. */
export const moduleLayoutRule = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Files under src/ sit in a layer folder of a kebab-case module.',
		},
		messages: {
			moduleName:
				'Name the module folder {{module}} in kebab-case (AGENTS.md boundaries).',
			outsideLayer: `Move this file into one of the layer folders of modules/{{module}}: ${LAYER_LIST} (AGENTS.md boundaries).`,
			outsideModule: `Move this file into src/modules/<module>/ under one of its layer folders: ${LAYER_LIST} (AGENTS.md boundaries).`,
		},
	},
	create(context) {
		const file = toFilePath(relative(context.cwd, context.filename))
		const modulePath = getModulePath(file)

		return {
			Program(node) {
				if (!modulePath) {
					if (file.path.startsWith('src/') && !isAstroPlaced(file))
						context.report({ node, messageId: 'outsideModule' })
					return
				}

				const { module, folder } = modulePath

				if (!MODULE_NAME_PATTERN.test(module))
					context.report({ node, messageId: 'moduleName', data: { module } })

				if (!isModuleLayer(folder))
					context.report({ node, messageId: 'outsideLayer', data: { module } })
			},
		}
	},
})
