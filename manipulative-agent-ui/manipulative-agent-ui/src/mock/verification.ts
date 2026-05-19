import type { VerificationResult } from '@/types'

export const verificationResults: VerificationResult[] = [
  {
    activityId: 1,
    passed: true,
    screenshotBefore: 'https://placehold.co/480x270/1e293b/10b981?text=Activity+1+✓+Passed',
    checks: [
      { name: 'Return button visible', passed: true },
      { name: 'Activity title displayed', passed: true },
      { name: 'Core interaction functional', passed: true },
      { name: 'Question navigation works', passed: true },
      { name: 'No console errors', passed: true },
    ],
  },
  {
    activityId: 2,
    passed: true,
    screenshotBefore: 'https://placehold.co/480x270/1e293b/f59e0b?text=Activity+2+Before+Fix',
    screenshotAfter: 'https://placehold.co/480x270/1e293b/10b981?text=Activity+2+After+Fix',
    checks: [
      { name: 'Return button visible', passed: true },
      { name: 'Activity title displayed', passed: true },
      { name: 'Core interaction functional', passed: true },
      { name: 'Question navigation works', passed: false },
      { name: 'No console errors', passed: true },
    ],
    fixDescription: 'Fixed question navigation: addEventListener was binding to wrong element. Changed selector from ".nav-btn" to ".question-nav button".',
  },
  {
    activityId: 3,
    passed: true,
    screenshotBefore: 'https://placehold.co/480x270/1e293b/10b981?text=Activity+3+✓+Passed',
    checks: [
      { name: 'Return button visible', passed: true },
      { name: 'Activity title displayed', passed: true },
      { name: 'Core interaction functional', passed: true },
      { name: 'Question navigation works', passed: true },
      { name: 'No console errors', passed: true },
    ],
  },
]
