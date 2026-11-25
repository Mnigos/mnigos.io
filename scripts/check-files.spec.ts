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

	it('rejects tracked text-[13px] with its path and line', () => {
		writeFixture(
			'src/modules/blog/presentation/post-card.astro',
			'<article>\n<p class="text-[13px]">Post</p>\n</article>\n'
		)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr:
				'src/modules/blog/presentation/post-card.astro:2: arbitrary Tailwind class text-[13px], use a theme token from src/styles/global.css\n',
		})
	})

	it.each([
		'max-xs:text-[11.5px]',
		'grid-cols-[1fr_auto]',
		'aria-[current=page]:text-ink',
		'max-xs:nth-[n+3]:border-t',
		'[&>dd]:pb-3',
		'[mask-type:alpha]',
		'bg-(--x)',
		'text-(color:--ink)',
		'[@media(hover:hover)]:text-ink',
		'[p]:text-ink',
		'[:nth-child(3)]:border-t',
		'[&[hidden]]:block',
		'[&:not([hidden])]:block',
		"[&[data-state='open']]:block",
		'[--layer2:1]',
		'[--my_color:red]',
	])('rejects %s in Astro class attributes and TypeScript strings', token => {
		writeFixture(
			'src/modules/blog/presentation/post-card.astro',
			`<p class='${token}'>Post</p>\n`
		)
		writeFixture(
			'src/modules/blog/presentation/styles.constants.ts',
			`\nconst className = "${token}"\n`
		)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr:
				`src/modules/blog/presentation/post-card.astro:1: arbitrary Tailwind class ${token}, use a theme token from src/styles/global.css\n` +
				`src/modules/blog/presentation/styles.constants.ts:2: arbitrary Tailwind class ${token}, use a theme token from src/styles/global.css\n`,
		})
	})

	it('reports each arbitrary class in class:list with its line number', () => {
		writeFixture(
			'src/modules/blog/presentation/post-card.astro',
			'<p class:list={["text-[13px] grid-cols-[1fr_auto]",\n\n\t`[&>dd]:pb-3`]} />\n'
		)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr:
				'src/modules/blog/presentation/post-card.astro:1: arbitrary Tailwind class text-[13px], use a theme token from src/styles/global.css\n' +
				'src/modules/blog/presentation/post-card.astro:1: arbitrary Tailwind class grid-cols-[1fr_auto], use a theme token from src/styles/global.css\n' +
				'src/modules/blog/presentation/post-card.astro:3: arbitrary Tailwind class [&>dd]:pb-3, use a theme token from src/styles/global.css\n',
		})
	})

	it.each([
		'const background = backgrounds[level]',
		'const visibleWeeks = weeks.slice(fromWeek, toWeek)',
		'const count = toWeek - fromWeek',
		'const first = items[0]',
		'type Names = string[]',
		'type Pair = [name: string, age: number]',
		'const pattern = /[0-9]:[0-9]/u',
		"const escaped = value.replace(/[&<>]/g, '')",
		'const entry = { [key]: value }',
		`const start = \`\${year}-01-01\``,
	])('accepts ordinary TypeScript: %s', content => {
		writeFixture('src/modules/blog/domain/example.helper.ts', `${content}\n`)

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it.each([
		'text-caption/5.25',
		'py-3.25',
		'current-page:text-ink',
		'max-xs:not-nth-2:border-t',
	])('accepts the theme class %s in Astro and TypeScript', token => {
		writeFixture(
			'src/modules/blog/presentation/post-card.astro',
			`<p class="${token}">Post</p>\n`
		)
		writeFixture(
			'src/modules/blog/presentation/styles.constants.ts',
			`const className = '${token}'\n`
		)

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it.each([
		[
			'src/styles/global.css',
			"@custom-variant x (&[aria-current='page']);\n.text-example { @apply text-[13px]; }\n",
		],
		['src/content/blog/post.mdx', '<p class="text-[13px]">Post</p>\n'],
		['src/content/example.ts', 'const className = "text-[13px]"\n'],
		[
			'src/modules/blog/domain/example.helper.spec.ts',
			'const className = "text-[13px]"\n',
		],
		['scripts/example.ts', 'const className = "text-[13px]"\n'],
	])('does not scan arbitrary classes in %s', (path, content) => {
		writeFixture(path, content)

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('ignores arbitrary classes in untracked source files', () => {
		writeFixture(
			'src/modules/blog/presentation/post-card.astro',
			'<p class="text-[13px]">Post</p>\n',
			false
		)
		writeFixture(
			'src/modules/blog/presentation/styles.constants.ts',
			'const className = "bg-(--x)"\n',
			false
		)

		expect(runCheck()).toStrictEqual({ status: 0, stdout: '', stderr: '' })
	})

	it('reports component paths, dashes and arbitrary classes together', () => {
		writeFixture(
			'src/components/PostCard.astro',
			`<p class="text-[13px]">Post ${emDash}</p>\n`
		)

		expect(runCheck()).toStrictEqual({
			status: 1,
			stdout: '',
			stderr:
				'src/components/PostCard.astro: name .astro components in kebab-case and keep them in src/modules/<module>/presentation/\n' +
				'src/components/PostCard.astro:1: em dash or en dash\n' +
				'src/components/PostCard.astro:1: arbitrary Tailwind class text-[13px], use a theme token from src/styles/global.css\n',
		})
	})
})
