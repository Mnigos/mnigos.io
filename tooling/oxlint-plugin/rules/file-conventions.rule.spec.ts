import { spawnSync } from 'node:child_process'
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'astro/zod'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

interface LintOptions {
	filename: string
	rules: string[]
	code?: string
	fix?: boolean
}

const plugin = fileURLToPath(new URL('../mnigos.plugin.mts', import.meta.url))
const executable = fileURLToPath(
	new URL('../../../node_modules/oxlint/bin/oxlint', import.meta.url)
)
const lintOutputSchema = z.object({
	diagnostics: z.array(z.object({ code: z.string(), message: z.string() })),
	number_of_files: z.number(),
})
const siblingPaths = [
	'src/modules/contributions/infrastructure/github.client.ts',
	'src/modules/contributions/infrastructure/github.client.types.ts',
	'src/modules/contributions/infrastructure/contributions.snapshot.ts',
	'src/modules/contributions/domain/contribution-grid.helper.ts',
	'src/modules/contributions/domain/contribution-grid.helper.spec.ts',
	'src/modules/profile/domain/profile.schema.ts',
	'src/modules/profile/content/profile.content.ts',
]
const boundRoles = [
	['client', 'infrastructure'],
	['query', 'infrastructure'],
	['repository', 'infrastructure'],
	['mapper', 'infrastructure'],
	['snapshot', 'infrastructure'],
	['content', 'content'],
	['handler', 'presentation'],
] as const
let directory: string

/** RuleTester rejects Bun, so these fixtures exercise the installed CLI and real plugin. */
function lint({
	filename,
	rules,
	code = filename.endsWith('.astro')
		? '---\nexport {}\n---\n<p />'
		: 'export {}',
	fix = false,
}: LintOptions) {
	const path = join(directory, filename)
	const config = join(directory, '.oxlintrc.json')

	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, code)
	writeFileSync(
		config,
		JSON.stringify({
			categories: { correctness: 'off' },
			jsPlugins: [plugin],
			rules: Object.fromEntries(rules.map(rule => [`mnigos/${rule}`, 'error'])),
		})
	)
	const { status, stdout, stderr, error } = spawnSync(
		'bun',
		[
			executable,
			'--config',
			config,
			'--format',
			'json',
			'--threads',
			'1',
			...(fix ? ['--fix'] : []),
			filename,
		],
		{ cwd: directory, encoding: 'utf-8' }
	)

	if (error) throw error

	expect(stderr).toBe('')
	const output = lintOutputSchema.parse(JSON.parse(stdout))

	expect(output.number_of_files).toBe(1)
	return {
		status,
		diagnostics: output.diagnostics,
		code: readFileSync(path, 'utf-8'),
	}
}

beforeEach(() => {
	directory = mkdtempSync(join(tmpdir(), 'MNG-17-oxlint-'))
})

afterEach(() => {
	rmSync(directory, { recursive: true, force: true })
})

describe('file-role-suffix', () => {
	it.each([
		...siblingPaths,
		'src/modules/blog/domain/post.helper.ts',
		'src/modules/blog/domain/post.helper.spec.ts',
		'src/content.config.ts',
		'src/content.config.spec.ts',
		'src/pages/index.ts',
		'src/pages/blog/[id].ts',
		'src/pages/rss.xml.ts',
		'src/modules/blog/presentation/post-page.astro',
		'src/layouts/Legacy.astro',
	])('accepts %s', filename => {
		const result = lint({ filename, rules: ['file-role-suffix'] })

		expect(result.status).toBe(0)
		expect(result.diagnostics).toStrictEqual([])
	})

	it.each([
		'src/modules/blog/domain/post.ts',
		'src/modules/blog/domain/post-sort.ts',
		'src/modules/blog/domain/PostSort.helper.ts',
		'src/modules/blog/domain/post_sort.helper.ts',
		'src/modules/blog/domain/post.widget.ts',
		'src/modules/blog/domain/post.client.query.types.ts',
		'src/modules/blog/domain/post.helper.spec.spec.ts',
		'src/pages-other/index.ts',
	])('rejects %s', filename => {
		const result = lint({ filename, rules: ['file-role-suffix'] })

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]?.code).toBe('mnigos(file-role-suffix)')
		expect(result.diagnostics[0]?.message).toContain(
			'Name the file <kebab-name>.<role>.ts'
		)
	})
})

describe('file-role-folder', () => {
	it.each(boundRoles)(
		'keeps %s files in %s, including nested specs',
		(role, layer) => {
			const result = lint({
				filename: `src/modules/blog/${layer}/nested/post.${role}.spec.ts`,
				rules: ['file-role-folder'],
			})

			expect(result.status).toBe(0)
			expect(result.diagnostics).toStrictEqual([])
		}
	)

	it.each(boundRoles)('rejects %s files in domain', (role, layer) => {
		const result = lint({
			filename: `src/modules/blog/domain/post.${role}.ts`,
			rules: ['file-role-folder'],
		})

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]).toMatchObject({
			code: 'mnigos(file-role-folder)',
			message: `A .${role}.ts file belongs in a module ${layer}/ folder (AGENTS.md naming table).`,
		})
	})

	it.each(boundRoles)('rejects %s files outside modules', (role, layer) => {
		const result = lint({
			filename: `src/post.${role}.ts`,
			rules: ['file-role-folder'],
		})

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]?.message).toBe(
			`A .${role}.ts file belongs in a module ${layer}/ folder (AGENTS.md naming table).`
		)
	})

	it.each([
		'src/modules/blog/domain/post.query.types.ts',
		'src/modules/blog/domain/post.types.query.spec.ts',
		'src/modules/blog/domain/infrastructure/post.query.ts',
		'src/modules/blog/post.query.types.ts',
	])('checks both roles and only the first layer in %s', filename => {
		const result = lint({ filename, rules: ['file-role-folder'] })

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]?.message).toContain(
			'A .query.ts file belongs in a module infrastructure/'
		)
	})

	it('reports each misplaced role in a two-role name', () => {
		const result = lint({
			filename: 'src/modules/blog/domain/post.client.query.ts',
			rules: ['file-role-folder'],
		})

		expect(result.status).toBe(1)
		expect(result.diagnostics.map(({ message }) => message)).toStrictEqual([
			'A .client.ts file belongs in a module infrastructure/ folder (AGENTS.md naming table).',
			'A .query.ts file belongs in a module infrastructure/ folder (AGENTS.md naming table).',
		])
	})

	it.each([
		'helper',
		'config',
		'constants',
		'errors',
		'parser',
		'schema',
		'schemas',
		'service',
		'types',
		'util',
	])('allows the unbound %s role in domain', role => {
		const result = lint({
			filename: `src/modules/blog/domain/post.${role}.ts`,
			rules: ['file-role-folder'],
		})

		expect(result.status).toBe(0)
		expect(result.diagnostics).toStrictEqual([])
	})
})

describe('module-layout', () => {
	it.each([
		'src/modules/blog/domain/post.helper.ts',
		'src/modules/blog/infrastructure/post.query.ts',
		'src/modules/blog/presentation/nested/post.handler.ts',
		'src/modules/blog/content/post.content.ts',
		'src/modules/blog-v2/domain/post.helper.ts',
		'src/content.config.ts',
		'src/content.config.spec.ts',
		'src/pages/index.ts',
		'src/pages/blog/rss.xml.ts',
		'src/env.d.ts',
		'scripts/tool.helper.ts',
	])('accepts %s', filename => {
		const result = lint({ filename, rules: ['module-layout'] })

		expect(result.status).toBe(0)
		expect(result.diagnostics).toStrictEqual([])
	})

	it.each([
		'src/modules/orphan.helper.ts',
		'src/lib/orphan.helper.ts',
		'src/orphan.helper.ts',
	])('rejects a file outside a module at %s', filename => {
		const result = lint({ filename, rules: ['module-layout'] })

		expect(result.status).toBe(1)
		expect(result.diagnostics).toStrictEqual([
			{
				code: 'mnigos(module-layout)',
				message:
					'Move this file into src/modules/<module>/ under one of its layer folders: domain/, infrastructure/, presentation/, content/ (AGENTS.md boundaries).',
			},
		])
	})

	it.each(['Blog', 'blog_module', '-blog', 'blog-', 'blog--module'])(
		'rejects the module name %s',
		module => {
			const result = lint({
				filename: `src/modules/${module}/domain/post.helper.ts`,
				rules: ['module-layout'],
			})

			expect(result.status).toBe(1)
			expect(result.diagnostics).toHaveLength(1)
			expect(result.diagnostics[0]?.message).toBe(
				`Name the module folder ${module} in kebab-case (AGENTS.md boundaries).`
			)
		}
	)

	it.each([
		'src/modules/blog/post.helper.ts',
		'src/modules/blog/lib/post.helper.ts',
		'src/modules/blog/application/post.helper.ts',
	])('rejects a file outside a layer at %s', filename => {
		const result = lint({ filename, rules: ['module-layout'] })

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]?.message).toContain(
			'Move this file into one of the layer folders of modules/blog:'
		)
	})

	it('reports both an invalid module name and a file at its root', () => {
		const result = lint({
			filename: 'src/modules/BadName/post.helper.ts',
			rules: ['module-layout'],
		})

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(2)
		expect(result.diagnostics[0]?.message).toBe(
			'Name the module folder BadName in kebab-case (AGENTS.md boundaries).'
		)
		expect(result.diagnostics[1]?.message).toContain(
			'Move this file into one of the layer folders of modules/BadName:'
		)
	})
})

describe('sibling module compatibility', () => {
	it.each(siblingPaths)('accepts %s with all file rules enabled', filename => {
		const result = lint({
			filename,
			rules: ['file-role-suffix', 'file-role-folder', 'module-layout'],
		})

		expect(result.status).toBe(0)
		expect(result.diagnostics).toStrictEqual([])
	})
})

describe('declaration-group-spacing', () => {
	it.each([
		'const first = 1\nconst second = 2',
		'const first = 1\n\n/** Separate group. */\nconst second = 2',
		'const first = 1\n\n// Separate group.\nconst second = 2',
		'const first = 1\n\nconst second = {\n value: 2\n}',
		'const { first } = value\n\nconst second = 2',
		'function run() {\nconst first = 1\n\nconst second = 2\n}',
	])('preserves allowed spacing in %s', code => {
		const result = lint({
			filename: 'spacing.ts',
			rules: ['declaration-group-spacing'],
			code,
		})

		expect(result.status).toBe(0)
		expect(result.diagnostics).toStrictEqual([])
	})

	it.each([
		[
			'const first = 1\n\nconst second = 2',
			'const first = 1\nconst second = 2',
		],
		[
			'export const first = 1\n\n\nexport const second = 2',
			'export const first = 1\nexport const second = 2',
		],
		[
			'const first = 1 // first\n\nconst second = 2',
			'const first = 1 // first\nconst second = 2',
		],
		[
			'const first = 1\r\n\r\nconst second = 2\r\n',
			'const first = 1\r\nconst second = 2\r\n',
		],
	])('reports and fixes blank lines in %s', (code, expected) => {
		const options = {
			filename: 'spacing.ts',
			rules: ['declaration-group-spacing'],
			code,
		}
		const result = lint(options)

		expect(result.status).toBe(1)
		expect(result.diagnostics).toHaveLength(1)
		expect(result.diagnostics[0]?.code).toBe(
			'mnigos(declaration-group-spacing)'
		)
		const fixed = lint({ ...options, fix: true })

		expect(fixed.status).toBe(0)
		expect(fixed.diagnostics).toStrictEqual([])
		expect(fixed.code).toBe(expected)
	})
})
