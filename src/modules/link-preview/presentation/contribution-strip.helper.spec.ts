import { describe, expect, it } from 'vitest'
import { getContributionStrip } from './contribution-strip.helper'

const COLORS = [
	'#171615',
	'#3a1a10',
	'#6e2a14',
	'#b23f1a',
	'#ff5a2e',
	'#ffc2a3',
	'#ffd3bd',
	'#ffe4d7',
	'#fff5ef',
]

describe('getContributionStrip', () => {
	it('draws one cell per level in the supplied order with its indexed color', () => {
		const levels = [8, 5, 0, 3, 7, 1, 4, 6, 2, 0]
		const strip = getContributionStrip(levels, COLORS)

		expect(strip.props.children).toHaveLength(levels.length)
		expect(
			strip.props.children.map(cell => cell.props.style.backgroundColor)
		).toStrictEqual([
			COLORS[8],
			COLORS[5],
			COLORS[0],
			COLORS[3],
			COLORS[7],
			COLORS[1],
			COLORS[4],
			COLORS[6],
			COLORS[2],
			COLORS[0],
		])
	})

	it.each([1, 26])(
		'fills the 1040 pixel content width with %i square cells and 6 pixel gaps',
		weeks => {
			const strip = getContributionStrip(
				Array.from({ length: weeks }, () => 0),
				COLORS
			)
			const { gap } = strip.props.style
			const widths = strip.props.children.map(cell => cell.props.style.width)

			expect(strip.props.children).toHaveLength(weeks)
			expect(gap).toBe(6)
			for (const cell of strip.props.children) {
				expect(cell.props.style.width).toBe(
					(1200 - 2 * 80 - 6 * (weeks - 1)) / weeks
				)
				expect(cell.props.style.height).toBe(cell.props.style.width)
				expect(cell.props.style.width).toBeGreaterThan(0)
			}
			expect(
				widths.reduce((total, width) => total + width, 0) + gap * (weeks - 1)
			).toBeCloseTo(1200 - 2 * 80, 10)
		}
	)
})
