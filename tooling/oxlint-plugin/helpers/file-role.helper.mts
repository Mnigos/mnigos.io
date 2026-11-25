import { posix } from 'node:path'

/** The closed naming table from AGENTS.md. */
export const ROLE_SUFFIXES = [
	'client',
	'config',
	'constants',
	'content',
	'errors',
	'handler',
	'helper',
	'mapper',
	'parser',
	'query',
	'repository',
	'schema',
	'schemas',
	'service',
	'snapshot',
	'types',
	'util',
] as const

export type RoleSuffix = (typeof ROLE_SUFFIXES)[number]

/** The layer folders a module may contain, in the order AGENTS.md lists them. */
export const MODULE_LAYERS = [
	'domain',
	'infrastructure',
	'presentation',
	'content',
] as const

export type ModuleLayer = (typeof MODULE_LAYERS)[number]

const ROLE = `(${ROLE_SUFFIXES.join('|')})`
const ROLE_FILE_PATTERN = new RegExp(
	String.raw`^[a-z0-9]+(?:-[a-z0-9]+)*\.${ROLE}(?:\.${ROLE})?(?:\.spec)?\.ts$`,
	'u'
)
const MODULE_PATH_PATTERN = /(?:^|\/)src\/modules\/([^/]+)\/(?:([^/]+)\/)?/u

export interface FilePath {
	path: string
	basename: string
}

export interface ModulePath {
	module: string
	folder: string | undefined
}

export function toFilePath(filename: string): FilePath {
	const path = filename.replaceAll('\\', '/')

	return {
		path,
		basename: posix.basename(path),
	}
}

export function hasSegment({ path }: FilePath, segment: string): boolean {
	return path.includes(`/${segment}/`) || path.startsWith(`${segment}/`)
}

/** Every role in the name, in order: `post.query.types.ts` gives `['query', 'types']`. */
export function getRoleSuffixes({ basename }: FilePath): string[] {
	const match = ROLE_FILE_PATTERN.exec(basename)

	return match ? match.slice(1).filter(role => role !== undefined) : []
}

/** The last role, which says what the file is: `types` for `post.query.types.ts`. */
export function getRoleSuffix(file: FilePath): string | undefined {
	return getRoleSuffixes(file).at(-1)
}

/** The module and its first folder for a file under `src/modules/`; `folder` is undefined for a file at the module root. */
export function getModulePath({ path }: FilePath): ModulePath | undefined {
	const match = MODULE_PATH_PATTERN.exec(path)

	return match?.[1] ? { module: match[1], folder: match[2] } : undefined
}

export function isModuleLayer(
	folder: string | undefined
): folder is ModuleLayer {
	return MODULE_LAYERS.some(layer => layer === folder)
}
