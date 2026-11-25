import { PREVIEW_IMAGE } from '../domain/preview-image.constants'

const { width, padding, strip } = PREVIEW_IMAGE

/** A row of square cells that spans the content width, one per week. */
export function getContributionStrip(
	levels: readonly number[],
	colors: readonly string[]
) {
	const size =
		(width - 2 * padding.x - strip.gap * (levels.length - 1)) / levels.length

	return {
		type: 'div',
		props: {
			style: { display: 'flex', gap: strip.gap, marginTop: 40 },
			children: levels.map(level => ({
				type: 'div',
				props: {
					style: {
						width: size,
						height: size,
						borderRadius: 4,
						backgroundColor: colors[level],
					},
				},
			})),
		},
	}
}
