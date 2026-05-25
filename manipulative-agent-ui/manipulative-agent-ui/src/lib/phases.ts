import type { AgentId, AgentStatus } from '@/types'

export type PhaseKind =
  | 'scan'
  | 'select'
  | 'design'
  | 'sketch'
  | 'gen-design'
  | 'gen-assets'
  | 'plan'
  | 'code'
  | 'deploy'
  | 'capture'
  | 'verify'
  | 'fix'

export type PhaseState = 'pending' | 'active' | 'done'

export interface PhaseBlueprint {
  id: string
  label: string
  kind: PhaseKind
  matchers: RegExp[]
}

export interface ResolvedPhase extends PhaseBlueprint {
  state: PhaseState
  text: string
}

const science: PhaseBlueprint[] = [
  {
    id: 'science-scan',
    label: 'Reading the topic',
    kind: 'scan',
    matchers: [/topic|grade|objective|concept|standard/i],
  },
  {
    id: 'science-select',
    label: 'Selecting components',
    kind: 'select',
    matchers: [/component|manipulative|visual model|representation/i],
  },
  {
    id: 'science-design',
    label: 'Drafting activities',
    kind: 'design',
    matchers: [/activity|interaction model|learning goal|exploration|practice|challenge/i],
  },
]

const design: PhaseBlueprint[] = [
  {
    id: 'design-sketch',
    label: 'Sketching layouts',
    kind: 'sketch',
    matchers: [/layout|wireframe|sketch|composition|hierarchy/i],
  },
  {
    id: 'design-gen-design',
    label: 'Rendering UI mockups',
    kind: 'gen-design',
    matchers: [/home page|activity \d|mockup|render|screen|UI/i],
  },
  {
    id: 'design-gen-assets',
    label: 'Generating assets',
    kind: 'gen-assets',
    matchers: [/asset|background|interactive|sprite|icon|illustration/i],
  },
]

const engineer: PhaseBlueprint[] = [
  {
    id: 'engineer-plan',
    label: 'Planning code structure',
    kind: 'plan',
    matchers: [/structure|architecture|module|framework|template/i],
  },
  {
    id: 'engineer-code',
    label: 'Writing HTML & JS',
    kind: 'code',
    matchers: [/html|javascript|js|function|render|canvas|component code/i],
  },
  {
    id: 'engineer-deploy',
    label: 'Deploying preview',
    kind: 'deploy',
    matchers: [/deploy|upload|hosting|url|preview link|publishing/i],
  },
]

const test: PhaseBlueprint[] = [
  {
    id: 'test-capture',
    label: 'Capturing screenshots',
    kind: 'capture',
    matchers: [/screenshot|capture|selenium|browser|page load/i],
  },
  {
    id: 'test-verify',
    label: 'Verifying behavior',
    kind: 'verify',
    matchers: [/check|verify|assert|interaction|click|drag|expected/i],
  },
  {
    id: 'test-fix',
    label: 'Auto-fix loop',
    kind: 'fix',
    matchers: [/fix|patch|retry|adjust|regenerate/i],
  },
]

export const phaseBlueprints: Record<AgentId, PhaseBlueprint[]> = {
  science,
  design,
  engineer,
  test,
}

const splitText = (text: string): string[] => {
  if (!text) return []
  return text
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function computePhases(
  agentId: AgentId,
  streamedText: string,
  status: AgentStatus,
): ResolvedPhase[] {
  const blueprints = phaseBlueprints[agentId]
  const segments = splitText(streamedText)
  const buckets: string[][] = blueprints.map(() => [])

  let currentIdx = 0
  for (const seg of segments) {
    let matchedIdx = -1
    for (let i = currentIdx; i < blueprints.length; i++) {
      if (blueprints[i].matchers.some((rx) => rx.test(seg))) {
        matchedIdx = i
        break
      }
    }
    if (matchedIdx >= 0) {
      currentIdx = matchedIdx
    }
    buckets[currentIdx].push(seg)
  }

  const isFinished = status === 'done' || status === 'awaiting_review'
  const lastBucketWithText = (() => {
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (buckets[i].length > 0) return i
    }
    return -1
  })()

  return blueprints.map((bp, i) => {
    const text = buckets[i].join('\n\n')
    let state: PhaseState
    if (isFinished) {
      state = 'done'
    } else if (i < lastBucketWithText) {
      state = 'done'
    } else if (i === lastBucketWithText) {
      state = 'active'
    } else if (lastBucketWithText === -1 && i === 0 && status === 'thinking') {
      state = 'active'
    } else {
      state = 'pending'
    }
    return { ...bp, state, text }
  })
}

export function activePhase(phases: ResolvedPhase[]): ResolvedPhase | undefined {
  return phases.find((p) => p.state === 'active') ?? phases.findLast?.((p) => p.state === 'done')
}

export function phaseProgress(phases: ResolvedPhase[]): { done: number; total: number } {
  return {
    done: phases.filter((p) => p.state === 'done').length,
    total: phases.length,
  }
}
