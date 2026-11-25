import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync } from 'node:fs'

/** Code points, because oxfmt turns `\u` escapes into the characters this script bans. */
const DASHES = [String.fromCodePoint(0x20_13), String.fromCodePoint(0x20_14)]
const COMPONENT_PATH_PATTERN =
	/^src\/modules\/[a-z0-9]+(?:-[a-z0-9]+)*\/presentation\/(?:[a-z0-9-]+\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.astro$/u
const ROUTE_PREFIX = 'src/pages/'

function getTrackedFiles() {
	return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf-8' })
		.split('\0')
		.filter(path => path !== '' && isRegularFile(path))
}

/** Skips symlinks such as CLAUDE.md and tracked files deleted from the working tree. */
function isRegularFile(path: string) {
	try {
		return lstatSync(path).isFile()
	} catch {
		return false
	}
}

function findDashes(path: string) {
	const content = readFileSync(path)

	if (content.includes(0)) return []

	return content
		.toString('utf-8')
		.split('\n')
		.flatMap((line, index) =>
			DASHES.some(dash => line.includes(dash))
				? [`${path}:${index + 1}: em dash or en dash`]
				: []
		)
}

/** oxlint skips `.astro` files without frontmatter, so their names and folders are checked here. */
function checkComponentPath(path: string) {
	if (
		!path.endsWith('.astro') ||
		path.startsWith(ROUTE_PREFIX) ||
		COMPONENT_PATH_PATTERN.test(path)
	)
		return []

	return [
		`${path}: name .astro components in kebab-case and keep them in src/modules/<module>/presentation/`,
	]
}

const problems = getTrackedFiles().flatMap(path => [
	...checkComponentPath(path),
	...findDashes(path),
])

if (problems.length > 0) {
	process.stderr.write(`${problems.join('\n')}\n`)
	process.exitCode = 1
}
