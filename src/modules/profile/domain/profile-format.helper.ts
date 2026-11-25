import type { Month } from './profile.schemas'

const numberFormat = new Intl.NumberFormat('en-US')
const compactNumberFormat = new Intl.NumberFormat('en-US', {
	notation: 'compact',
})

/** Groups digits below a million and abbreviates from there: 73,000 but 362M. */
export function formatFactValue(value: number) {
	return (value >= 1_000_000 ? compactNumberFormat : numberFormat).format(value)
}

/** `2026-03` becomes `03.2026`. */
export function formatMonth(month: Month) {
	return `${month.slice(5)}.${month.slice(0, 4)}`
}
