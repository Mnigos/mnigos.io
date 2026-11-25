import { describe, expect, it } from 'vitest'
import { fitPreviewTitle } from './preview-title.helper'

describe('fitPreviewTitle', () => {
	it.each(['Work', 'Blog', 'Igor Makowski'])(
		'%s uses the largest size',
		title => {
			expect(fitPreviewTitle(title)).toStrictEqual({
				fontSize: 120,
				lineClamp: 2,
			})
		}
	)

	it('shrinks a published post title to keep it visible', () => {
		expect(
			fitPreviewTitle('Why rigtch.fm stores every play itself')
		).toStrictEqual({
			fontSize: 96,
			lineClamp: 3,
		})
	})

	it.each([
		[20, 120],
		[40, 96],
		[60, 80],
		[100, 64],
		[1000, 56],
	])('fits a single word of %i characters at %i pixels', (length, expected) => {
		expect(fitPreviewTitle('x'.repeat(length)).fontSize).toBe(expected)
	})

	it.each(['word '.repeat(200), 'x'.repeat(10_000)])(
		'clamps an overlong title to a finite number of lines (%#)',
		title => {
			expect(fitPreviewTitle(title)).toStrictEqual({
				fontSize: 56,
				lineClamp: 5,
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
			lineClamp: 2,
		})
	})
})
