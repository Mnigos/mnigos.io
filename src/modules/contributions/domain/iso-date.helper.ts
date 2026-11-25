const DAY_MS = 86_400_000

export function addDays(date: string, days: number) {
	return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10)
}

export function getDayOfYear(date: string) {
	return (Date.parse(date) - Date.parse(`${date.slice(0, 4)}-01-01`)) / DAY_MS
}

export function getDaysInYear(year: number) {
	return getDayOfYear(`${year}-12-31`) + 1
}
