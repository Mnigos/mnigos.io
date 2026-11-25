import { getContributionLevel } from '../../contributions/domain/contribution-level.helper'
import { addDays } from '../../contributions/domain/iso-date.helper'
import { getWeeklyTotals } from '../../contributions/domain/weekly-totals.helper'
import { loadSnapshotContributionYears } from '../../contributions/infrastructure/contributions.client'
import { WEEKLY_THRESHOLDS } from '../../work/domain/job-weeks.helper'
import { PREVIEW_IMAGE } from '../domain/preview-image.constants'

/** One level per week, oldest first, on the same scale as the work page's weekly cells. Reads only the committed snapshots, so rendering the image never calls GitHub. */
export async function loadRecentWeekLevels(today: string) {
	const { weeks } = PREVIEW_IMAGE.strip
	const { years } = await loadSnapshotContributionYears()
	const totals = getWeeklyTotals(years, {
		from: addDays(today, 1 - weeks * 7),
		to: today,
	})

	return totals.map(({ total }) =>
		getContributionLevel(total, WEEKLY_THRESHOLDS)
	)
}
