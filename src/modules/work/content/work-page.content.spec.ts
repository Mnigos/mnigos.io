import { describe, expect, test } from 'vitest'
import { WORK_PAGE } from './work-page.content'

describe('WORK_PAGE', () => {
	test('keeps the approved product page link text', () => {
		expect(WORK_PAGE.productPageLink).toBe('More about rigtch.fm')
	})
})
