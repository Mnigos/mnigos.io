/** Sizes in pixels; `letterSpacing` is in em, matching the `heading` utility in global.css. */
export const PREVIEW_IMAGE = {
	width: 1200,
	height: 630,
	padding: { x: 80, y: 56 },
	type: 'image/png',
	title: { maxHeight: 230, lineHeight: 1.05, letterSpacing: -0.045 },
	description: { fontSize: 30, lineHeight: 1.35, lineClamp: 2 },
	strip: { weeks: 26, gap: 6 },
} as const
