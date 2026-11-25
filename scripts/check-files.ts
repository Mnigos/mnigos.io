import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync } from 'node:fs'

/** Code points, because oxfmt turns `\u` escapes into the characters this script bans. */
const DASHES = [String.fromCodePoint(0x20_13), String.fromCodePoint(0x20_14)]
const COMPONENT_PATH_PATTERN =
	/^src\/modules\/[a-z0-9]+(?:-[a-z0-9]+)*\/presentation\/(?:[a-z0-9-]+\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.astro$/u
const ROUTE_PREFIX = 'src/pages/'
const CLASS_SOURCE_PATTERN = /^src\/(?!content\/).+(?<!\.spec)\.(?:astro|ts)$/u
/** Matches `text-[13px]`, `bg-(--x)`, any `[...]:` variant such as `[&>dd]:` and `[mask-type:alpha]` inside one class token. */
const ARBITRARY_CLASS_PATTERN =
	/[a-z\d]-\[|[a-z\d]-\((?:[a-z-]+:)?--|\[\S*\]:!?-?[a-z@]|(?:^|:)\[-*[a-z][\w-]*:[^\s\]]+\]/u
/** A class token may hold quotes only inside brackets, as in `[&[data-state='open']]:block`. */
const CLASS_TOKEN_PATTERN =
	/(?:[^\s'"`[\]]|\[[^\s[\]]*(?:\[[^\s[\]]*\][^\s[\]]*)*\])+/gu

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

/** oxlint skips the template part of `.astro` files, so class attributes are checked here. */
function findArbitraryClasses(path: string) {
	if (!CLASS_SOURCE_PATTERN.test(path)) return []

	return readFileSync(path, 'utf-8')
		.split('\n')
		.flatMap((line, index) =>
			(line.match(CLASS_TOKEN_PATTERN) ?? [])
				.filter(token => ARBITRARY_CLASS_PATTERN.test(token))
				.map(
					token =>
						`${path}:${index + 1}: arbitrary Tailwind class ${token}, use a theme token from src/styles/global.css`
				)
		)
}

const problems = getTrackedFiles().flatMap(path => [
	...checkComponentPath(path),
	...findDashes(path),
	...findArbitraryClasses(path),
])

if (problems.length > 0) {
	process.stderr.write(`${problems.join('\n')}\n`)
	process.exitCode = 1
}
