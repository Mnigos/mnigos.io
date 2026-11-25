import { describe, expect, it } from 'vitest'
import { fitPreviewTitle } from './preview-title.helper'

describe('fitPreviewTitle', () => {
	it.each(['Work', 'Blog', 'Igor Makowski'])(
		'%s uses the largest size',
		title => {
			expect(fitPreviewTitle(title)).toStrictEqual({
				fontSize: 120,
				lineClamp: 1,
			})
		}
	)

	it('shrinks a published post title to keep it visible', () => {
		expect(
			fitPreviewTitle('Why rigtch.fm stores every play itself')
		).toStrictEqual({
			fontSize: 80,
			lineClamp: 2,
		})
	})

	it.each([
		[20, 96],
		[40, 80],
		[60, 64],
		[100, 56],
		[1000, 56],
	])('fits a single word of %i characters at %i pixels', (length, expected) => {
		expect(fitPreviewTitle('x'.repeat(length)).fontSize).toBe(expected)
	})

	it.each([
		[15, 120, 1],
		[16, 96, 2],
		[38, 96, 2],
		[39, 80, 2],
		[46, 80, 2],
		[47, 64, 3],
		[87, 64, 3],
		[88, 56, 3],
		[99, 56, 3],
	])(
		'fits %i characters at %i pixels with %i lines',
		(length, fontSize, lineClamp) => {
			expect(fitPreviewTitle('x'.repeat(length))).toStrictEqual({
				fontSize,
				lineClamp,
			})
		}
	)

	it.each(['word '.repeat(200), 'x'.repeat(10_000)])(
		'clamps an overlong title to a finite number of lines (%#)',
		title => {
			expect(fitPreviewTitle(title)).toStrictEqual({
				fontSize: 56,
				lineClamp: 3,
			})
		}
	)

	it.each([
		'Why rigtch.fm stores every play itself '.repeat(10),
		'x'.repeat(400),
	])('never increases the size when appending characters (%#)', title => {
		const sizes = Array.from(
			{ length: title.length },
			(_, index) => fitPreviewTitle(title.slice(0, index + 1)).fontSize
		)

		for (const [index, size] of sizes.slice(1).entries()) {
			expect(size, `prefix length ${index + 2}`).toBeLessThanOrEqual(
				sizes[index]
			)
		}
	})

	it.each([' ', '  ', '\t', '\n', ' \r\n\t '])(
		'normalizes surrounding and inter-word whitespace %j',
		separator => {
			const words = ['Why', 'rigtch.fm', 'stores', 'every', 'play', 'itself']

			expect(
				fitPreviewTitle(`${separator}${words.join(separator)}${separator}`)
			).toStrictEqual(fitPreviewTitle(words.join(' ')))
		}
	)

	it.each(['', ' ', '\r\n\t'])('handles an empty title %j', title => {
		expect(fitPreviewTitle(title)).toStrictEqual({
			fontSize: 120,
			lineClamp: 1,
		})
	})
})
