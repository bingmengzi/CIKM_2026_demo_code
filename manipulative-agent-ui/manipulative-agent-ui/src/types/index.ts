export type AgentId = 'science' | 'design' | 'engineer' | 'test'

export type AgentStatus = 'idle' | 'thinking' | 'done' | 'awaiting_review'

export interface AgentInfo {
  id: AgentId
  name: string
  description: string
  color: string
  icon: string
}

export interface AgentMessage {
  agentId: AgentId
  content: string
  timestamp?: number
}

export interface CodeIteration {
  version: number
  label: string
  code: string
  description: string
}

export type PipelinePhase =
  | 'input'
  | 'running'
  | 'review'
  | 'complete'

export type PreviewTab = 'design' | 'assets' | 'preview' | 'verify'

export interface DesignImage {
  id: string
  label: string
  imageUrl: string
  prompt: string
}

export interface AssetItem {
  id: string
  activityId: number
  name: string
  imageUrl: string
  prompt: string
  category: 'background' | 'static' | 'interactive' | 'item'
}

export interface VerificationResult {
  activityId: number
  passed: boolean
  screenshotBefore: string
  screenshotAfter?: string
  checks: { name: string; passed: boolean }[]
  fixDescription?: string
}

export interface ActivityPlan {
  id: number
  title: string
  aspect: string
  learningGoal: string
  interactionModel: string
  description: string
}
