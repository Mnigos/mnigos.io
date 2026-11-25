import { PREVIEW_IMAGE } from './preview-image.constants'

/** Advance width of every Martian Mono glyph, in em. */
const GLYPH_ADVANCE = 0.6
const TITLE_WIDTH = PREVIEW_IMAGE.width - 2 * PREVIEW_IMAGE.padding
const { maxHeight, lineHeight, letterSpacing } = PREVIEW_IMAGE.title

export interface PreviewTitleFit {
	fontSize: number
	lineClamp: number
}

interface Wrap {
	lines: number
	used: number
}

function getFit(fontSize: number) {
	return {
		fontSize,
		charsPerLine: Math.floor(
			TITLE_WIDTH / (fontSize * (GLYPH_ADVANCE + letterSpacing))
		),
		lineClamp: Math.floor(maxHeight / (fontSize * lineHeight)),
	}
}

const FITS = [120, 96, 80, 64].map(getFit)
const SMALLEST_FIT = getFit(56)

/** Greedy word wrap counted in characters, exact for a monospaced face. */
function countLines(words: readonly string[], charsPerLine: number) {
	return words.reduce<Wrap>(
		({ lines, used }, word) =>
			used > 0 && used + 1 + word.length <= charsPerLine
				? { lines, used: used + 1 + word.length }
				: {
						lines: lines + Math.ceil(word.length / charsPerLine),
						used: ((word.length - 1) % charsPerLine) + 1,
					},
		{ lines: 0, used: 0 }
	).lines
}

/** The largest size that shows the whole title; past the smallest one the image clamps it. */
export function fitPreviewTitle(title: string): PreviewTitleFit {
	const words = title.trim().split(/\s+/u)
	const { fontSize, lineClamp } =
		FITS.find(fit => countLines(words, fit.charsPerLine) <= fit.lineClamp) ??
		SMALLEST_FIT

	return { fontSize, lineClamp }
}
