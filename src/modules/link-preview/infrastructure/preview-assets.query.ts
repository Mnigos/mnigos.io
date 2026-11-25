import { readFile } from 'node:fs/promises'
import type { Font } from 'satori'

/** Paths from the project root, because Astro bundles this file away from its folder before running it. */
const FONTS_DIR = 'src/modules/link-preview/infrastructure/fonts'
const THEME_PATH = 'src/styles/global.css'
const LOGO_PATH = 'public/favicon.svg'

function readThemeColor(css: string, name: string) {
	const value = new RegExp(
		String.raw`--color-${name}:\s*(#[\da-f]+);`,
		'iu'
	).exec(css)?.[1]

	if (!value) throw new Error(`${THEME_PATH} has no --color-${name}`)

	return value
}

/** The fonts, the logo and the theme colors the site itself uses. */
export async function loadPreviewAssets() {
	const [martianMono, martianMonoRegular, archivo, css, logo] =
		await Promise.all([
			readFile(`${FONTS_DIR}/MartianMono-CnxBd.ttf`),
			readFile(`${FONTS_DIR}/MartianMono-CnRg.ttf`),
			readFile(`${FONTS_DIR}/Archivo-Regular.ttf`),
			readFile(THEME_PATH, 'utf-8'),
			readFile(LOGO_PATH),
		])

	return {
		fonts: [
			{ name: 'Martian Mono', data: martianMono, weight: 800 },
			{ name: 'Martian Mono', data: martianMonoRegular, weight: 400 },
			{ name: 'Archivo', data: archivo, weight: 400 },
		] satisfies Font[],
		colors: {
			bg: readThemeColor(css, 'bg'),
			ink: readThemeColor(css, 'ink'),
			dim: readThemeColor(css, 'dim'),
			faint: readThemeColor(css, 'faint'),
			line: readThemeColor(css, 'line-strong'),
			levels: [
				'cell',
				'level-1',
				'level-2',
				'level-3',
				'level-4',
				'level-5',
			].map(name => readThemeColor(css, name)),
		},
		logo: `data:image/svg+xml;base64,${logo.toString('base64')}`,
	}
}
