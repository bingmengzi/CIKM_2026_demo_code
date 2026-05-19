import type { ActivityPlan } from '@/types'

export const activityPlans: ActivityPlan[] = [
  {
    id: 1,
    title: 'Fraction Exploration',
    aspect: 'Visual representation of fractions',
    learningGoal: 'Students understand that fractions represent parts of a whole through interactive bar manipulation',
    interactionModel: 'slider',
    description: 'Two adjustable fraction bars side-by-side. Students use sliders to set numerator and denominator, observing how the shaded area changes in real-time.',
  },
  {
    id: 2,
    title: 'Comparison Practice',
    aspect: 'Comparing fractions with unlike denominators',
    learningGoal: 'Students can determine which of two fractions is greater using visual models, overcoming whole-number reasoning bias',
    interactionModel: 'click',
    description: 'Present pairs of fractions. Students predict which is larger (>, <, =) before the visual comparison reveals the answer. 10 progressively harder questions.',
  },
  {
    id: 3,
    title: 'Number Line Challenge',
    aspect: 'Placing fractions on a number line',
    learningGoal: 'Students develop proportional reasoning by positioning fractions accurately on a 0-1 number line',
    interactionModel: 'drag-sort',
    description: 'Timed challenge: drag fraction cards to their correct position on a number line. Score based on accuracy and speed. Includes equivalent fraction bonus rounds.',
  },
]
