import { execFileSync, spawnSync } from 'node:child_process'
import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const script = fileURLToPath(new URL('check-files.ts', import.meta.url))
const emDash = String.fromCodePoint(0x20_14)
const enDash = String.fromCodePoint(0x20_13)
let repository: string

function writeFixture(
	path: string,
	content: string | Uint8Array,
	tracked = true
) {
	const absolutePath = join(repository, path)

	mkdirSync(dirname(absolutePath), { recursive: true })
	writeFileSync(absolutePath, content)
	if (tracked)
		execFileSync('git', ['add', '-f', '--', path], { cwd: repository })
}

function runCheck() {
	const { status, stdout, stderr, error } = spawnSync('bun', [script], {
		cwd: repository,
		encoding: 'utf-8',
	})

	if (error) throw error

	return { status, stdout, stderr }
}

describe('check-files', () => {
	beforeEach(() => {
		repository = mkdtempSync(join(tmpdir(), 'MNG-17-check-files-'))
		execFileSync('git', ['init', '--quiet'], { cwd: repository })
	})

	afterEach(() => {
		rmSync(repository, { recursive: true, force: true })
	})

	it.each([
		['em dash', emDash],
		['en dash', enDash],
	])('rejects a tracked %s with its path and line', (_name, dash) => {
		writeFixture('notes.md', `clean\ncontains ${dash} here\n`)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr: 'notes.md:2: em dash or en dash\n',
		})
	})

	it('reports all offending lines once even when both dashes share a line', () => {
		writeFixture(
			'notes.md',
			`first ${emDash} ${enDash}\nclean\nlast ${enDash}\n`
		)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr:
				'notes.md:1: em dash or en dash\nnotes.md:3: em dash or en dash\n',
		})
	})

	it('passes a tracked clean file', () => {
		writeFixture('notes.md', 'Plain text, hyphen-separated words.\n')

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('skips a binary file containing the dash bytes and a NUL', () => {
		writeFixture('image.bin', Buffer.from(`${emDash}\0${enDash}`))

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('skips a tracked symlink even with an invalid component path and dash target', () => {
		writeFixture('target.md', `contains ${emDash}`, false)
		const link = 'src/components/BadName.astro'
		const absoluteLink = join(repository, link)

		mkdirSync(dirname(absoluteLink), { recursive: true })
		symlinkSync('../../target.md', absoluteLink)
		execFileSync('git', ['add', '--', link], { cwd: repository })

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('skips a deleted tracked file', () => {
		writeFixture('notes.md', `contains ${emDash}`)
		rmSync(join(repository, 'notes.md'))

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('ignores untracked files containing a dash', () => {
		writeFixture('notes.md', `contains ${emDash} and ${enDash}`, false)

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it.each([
		'src/modules/blog/presentation/post-page.astro',
		'src/modules/blog/presentation/cards/post-card.astro',
		'src/pages/index.astro',
		'src/pages/blog/[id].astro',
		'src/pages/LegacyPage.astro',
	])('accepts a tracked component or route at %s', path => {
		writeFixture(path, '<p>Post</p>\n')

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it.each([
		'src/modules/blog/presentation/PostCard.astro',
		'src/modules/blog/domain/post-card.astro',
		'src/components/post-card.astro',
		'src/modules/BadModule/presentation/post-card.astro',
		'src/modules/blog/presentation/post_card.astro',
	])('rejects a tracked component at %s without frontmatter', path => {
		writeFixture(path, '<p>Post</p>\n')

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr: `${path}: name .astro components in kebab-case and keep them in src/modules/<module>/presentation/\n`,
		})
	})
})
