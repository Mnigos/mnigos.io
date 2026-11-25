import { describe, expect, it } from 'vitest'
import {
	getModulePath,
	getRoleSuffix,
	getRoleSuffixes,
	hasSegment,
	isModuleLayer,
	MODULE_LAYERS,
	ROLE_SUFFIXES,
	toFilePath,
} from './file-role.helper.mts'

describe('toFilePath', () => {
	it.each([
		'/repo/src/modules/blog/domain/post.helper.ts',
		String.raw`\repo\src\modules\blog\domain\post.helper.ts`,
	])('normalizes %s', filename => {
		expect(toFilePath(filename)).toStrictEqual({
			path: '/repo/src/modules/blog/domain/post.helper.ts',
			basename: 'post.helper.ts',
			directory: '/repo/src/modules/blog/domain',
		})
	})

	it('preserves a Windows drive and normalizes its separators', () => {
		expect(toFilePath(String.raw`C:\repo\src\pages\index.ts`)).toStrictEqual({
			path: 'C:/repo/src/pages/index.ts',
			basename: 'index.ts',
			directory: 'C:/repo/src/pages',
		})
	})
})

describe('hasSegment', () => {
	it.each([
		['src/pages/index.ts', 'src/pages', true],
		['/repo/src/pages/blog/index.ts', 'src/pages', true],
		['/repo/src/modules/blog/domain/post.helper.ts', 'domain', true],
		['/repo/src/pages-other/index.ts', 'src/pages', false],
		['/repo/not-src/pages/index.ts', 'src/pages', false],
		['/repo/src/modules/blog/domain-extra/post.helper.ts', 'domain', false],
	] as const)(
		'matches complete segments in %s',
		(filename, segment, expected) => {
			expect(hasSegment(toFilePath(filename), segment)).toBe(expected)
		}
	)
})

describe('getRoleSuffixes and getRoleSuffix', () => {
	it('keeps the naming table closed', () => {
		expect(ROLE_SUFFIXES).toStrictEqual([
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
		])
	})

	it.each(ROLE_SUFFIXES)('accepts the %s role with and without .spec', role => {
		for (const filename of [`post.${role}.ts`, `post.${role}.spec.ts`]) {
			const file = toFilePath(filename)

			expect(getRoleSuffixes(file)).toStrictEqual([role])
			expect(getRoleSuffix(file)).toBe(role)
		}
	})

	it.each([
		['github.client.types.ts', ['client', 'types']],
		['github.client.types.spec.ts', ['client', 'types']],
		['contribution-grid.helper.spec.ts', ['helper']],
		['contributions.snapshot.ts', ['snapshot']],
		['profile.schema.ts', ['schema']],
		['profile.content.ts', ['content']],
		['content.config.ts', ['config']],
		['content.config.spec.ts', ['config']],
	] as const)('reads roles in order from %s', (filename, roles) => {
		const file = toFilePath(filename)

		expect(getRoleSuffixes(file)).toStrictEqual(roles)
		expect(getRoleSuffix(file)).toBe(roles.at(-1))
	})

	it.each([
		'PostSort.helper.ts',
		'post_sort.helper.ts',
		'post.widget.ts',
		'post.ts',
		'post.helper.mts',
		'post.helper.tsx',
		'post.client.query.types.ts',
		'post.helper.spec.spec.ts',
		'post-.helper.ts',
		'post..helper.ts',
	])('rejects %s', filename => {
		const file = toFilePath(filename)

		expect(getRoleSuffixes(file)).toStrictEqual([])
		expect(getRoleSuffix(file)).toBeUndefined()
	})
})

describe('getModulePath', () => {
	it.each([
		[
			'src/modules/blog/domain/post.helper.ts',
			{ module: 'blog', folder: 'domain' },
		],
		[
			'/repo/src/modules/contributions/infrastructure/github.client.types.ts',
			{ module: 'contributions', folder: 'infrastructure' },
		],
		[
			String.raw`C:\repo\src\modules\profile\content\profile.content.ts`,
			{ module: 'profile', folder: 'content' },
		],
		[
			'src/modules/blog/domain/nested/post.helper.ts',
			{ module: 'blog', folder: 'domain' },
		],
		['src/modules/blog/post.helper.ts', { module: 'blog', folder: undefined }],
		['src/modules/blog/lib/post.helper.ts', { module: 'blog', folder: 'lib' }],
		['src/pages/index.ts', undefined],
		['src/not-modules/blog/domain/post.helper.ts', undefined],
		['not-src/modules/blog/domain/post.helper.ts', undefined],
	] as const)('reads the first layer from %s', (filename, expected) => {
		expect(getModulePath(toFilePath(filename))).toStrictEqual(expected)
	})
})

describe('isModuleLayer', () => {
	it('accepts exactly the documented layers', () => {
		expect(MODULE_LAYERS).toStrictEqual([
			'domain',
			'infrastructure',
			'presentation',
			'content',
		])
		for (const layer of MODULE_LAYERS) expect(isModuleLayer(layer)).toBe(true)
	})

	it.each([undefined, '', 'lib', 'application', 'Domain'])(
		'rejects %s',
		folder => {
			expect(isModuleLayer(folder)).toBe(false)
		}
	)
})
