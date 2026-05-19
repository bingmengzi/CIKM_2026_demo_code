import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react'
import type { AgentId, AgentStatus, PipelinePhase } from '@/types'
import { fractionScenario } from '@/mock/scenario-fraction'

type AgentStatuses = Record<AgentId, AgentStatus>

interface OrchestrationState {
  agentStatuses: AgentStatuses
  streamedTexts: Record<AgentId, string>
  activeAgent: AgentId | null
  currentIteration: number
  isRunning: boolean
  phase: PipelinePhase
  userInput: string
  scenario: typeof fractionScenario
  designImages: Record<string, { url: string; prompt: string }>
  assets: Record<string, { url: string; prompt: string; category: string; activity_id: number; name: string }>
  verificationResults: any[]
  previewUrl: string | null
  submitInput: (input: string) => void
  approveAndContinue: () => void
  editAndContinue: (feedback: string) => void
  resetDemo: () => void
  regenerateImage: (imageId: string, newPrompt: string) => Promise<string | null>
}

const OrchestrationContext = createContext<OrchestrationState | null>(null)

export function useOrchestration(): OrchestrationState {
  const ctx = useContext(OrchestrationContext)
  if (!ctx) throw new Error('useOrchestration must be used within OrchestrationProvider')
  return ctx
}

export function useOrchestrationProvider(): OrchestrationState {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatuses>({
    science: 'idle',
    design: 'idle',
    engineer: 'idle',
    test: 'idle',
  })
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null)
  const [streamedTexts, setStreamedTexts] = useState<Record<AgentId, string>>({
    science: '',
    design: '',
    engineer: '',
    test: '',
  })
  const [currentIteration, setCurrentIteration] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<PipelinePhase>('input')
  const [userInput, setUserInput] = useState('')
  const [designImages, setDesignImages] = useState<Record<string, { url: string; prompt: string }>>({})
  const [assets, setAssets] = useState<Record<string, any>>({})
  const [verificationResults, setVerificationResults] = useState<any[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Connect to SSE stream
  const connectSSE = useCallback((sessionId: string) => {
    const es = new EventSource(`/api/stream/${sessionId}`)
    eventSourceRef.current = es

    es.addEventListener('agent_start', (e) => {
      const data = JSON.parse(e.data)
      const agent = data.agent as AgentId
      setActiveAgent(agent)
      setAgentStatuses((prev) => ({ ...prev, [agent]: 'thinking' }))
      setPhase('running')
    })

    es.addEventListener('agent_thinking', (e) => {
      const data = JSON.parse(e.data)
      const agent = data.agent as AgentId
      setStreamedTexts((prev) => ({
        ...prev,
        [agent]: prev[agent] + (data.delta || ''),
      }))
    })

    es.addEventListener('agent_output', (e) => {
      const data = JSON.parse(e.data)
      // Structured output — activity plan etc.
      if (data.type === 'activity_plan' && data.data) {
        // Store in scenario or activity plan state if needed
      }
    })

    es.addEventListener('checkpoint', (e) => {
      const data = JSON.parse(e.data)
      const agent = data.agent as AgentId
      setAgentStatuses((prev) => ({ ...prev, [agent]: 'awaiting_review' }))
      setPhase('review')
    })

    es.addEventListener('agent_done', (e) => {
      const data = JSON.parse(e.data)
      const agent = data.agent as AgentId
      setAgentStatuses((prev) => ({ ...prev, [agent]: 'done' }))
    })

    es.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data)
      const agent = data.agent as AgentId
      // Append progress info to thinking text
      const status = data.done ? '✓' : '...'
      setStreamedTexts((prev) => ({
        ...prev,
        [agent]: prev[agent] + `\n${status} ${data.item} (${data.completed}/${data.total})`,
      }))
    })

    es.addEventListener('image_ready', (e) => {
      const data = JSON.parse(e.data)
      setDesignImages((prev) => ({
        ...prev,
        [data.id]: { url: data.url, prompt: data.prompt },
      }))
      setCurrentIteration((prev) => Math.max(prev, 1))
    })

    es.addEventListener('asset_ready', (e) => {
      const data = JSON.parse(e.data)
      setAssets((prev) => ({
        ...prev,
        [data.id]: {
          url: data.url,
          prompt: data.prompt,
          category: data.category,
          activity_id: data.activity_id,
          name: data.name,
        },
      }))
    })

    es.addEventListener('preview_ready', (e) => {
      const data = JSON.parse(e.data)
      setPreviewUrl(data.url)
      setCurrentIteration(2)
    })

    es.addEventListener('verify_result', (e) => {
      const data = JSON.parse(e.data)
      setVerificationResults((prev) => [...prev, data])
    })

    es.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data)
      setPreviewUrl(data.final_url)
      setPhase('complete')
      setIsRunning(false)
      setActiveAgent(null)
      setCurrentIteration(3)
      es.close()
    })

    es.addEventListener('error', (e) => {
      // SSE error event (not the custom "error" event from backend)
      if (es.readyState === EventSource.CLOSED) return
    })

    // Listen for custom "error" event from backend
    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data)
        if (data.message) {
          console.error('Pipeline error:', data.message)
          setPhase('complete')
          setIsRunning(false)
        }
      } catch {
        // Native SSE error, not our custom event
      }
    })
  }, [])

  // Submit user input → start pipeline
  const submitInput = useCallback(async (input: string) => {
    setUserInput(input)
    setIsRunning(true)
    setPhase('running')
    setAgentStatuses({ science: 'idle', design: 'idle', engineer: 'idle', test: 'idle' })
    setStreamedTexts({ science: '', design: '', engineer: '', test: '' })
    setDesignImages({})
    setAssets({})
    setVerificationResults([])
    setPreviewUrl(null)
    setActiveAgent(null)
    setCurrentIteration(0)

    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      })
      const data = await resp.json()
      sessionIdRef.current = data.session_id
      connectSSE(data.session_id)
    } catch (err) {
      console.error('Failed to start pipeline:', err)
      setPhase('input')
      setIsRunning(false)
    }
  }, [connectSSE])

  // Approve current checkpoint
  const approveAndContinue = useCallback(async () => {
    if (!sessionIdRef.current || !activeAgent) return
    setAgentStatuses((prev) => ({ ...prev, [activeAgent]: 'done' }))
    setPhase('running')

    await fetch(`/api/approve/${sessionIdRef.current}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: activeAgent }),
    })
  }, [activeAgent])

  // Submit feedback
  const editAndContinue = useCallback(async (feedback: string) => {
    if (!sessionIdRef.current || !activeAgent) return
    setStreamedTexts((prev) => ({
      ...prev,
      [activeAgent]: prev[activeAgent] + `\n\n[Teacher feedback: ${feedback}]\n— Acknowledged, adjusting...`,
    }))
    setAgentStatuses((prev) => ({ ...prev, [activeAgent]: 'done' }))
    setPhase('running')

    await fetch(`/api/feedback/${sessionIdRef.current}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: activeAgent, feedback }),
    })
  }, [activeAgent])

  // Regenerate a single image
  const regenerateImage = useCallback(async (imageId: string, newPrompt: string): Promise<string | null> => {
    if (!sessionIdRef.current) return null
    try {
      const resp = await fetch(`/api/regenerate-image/${sessionIdRef.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId, new_prompt: newPrompt }),
      })
      const data = await resp.json()
      if (data.ok && data.url) {
        // Update local state
        if (imageId in designImages) {
          setDesignImages((prev) => ({ ...prev, [imageId]: { url: data.url, prompt: newPrompt } }))
        } else {
          setAssets((prev) => ({ ...prev, [imageId]: { ...prev[imageId], url: data.url, prompt: newPrompt } }))
        }
        return data.url
      }
      return null
    } catch {
      return null
    }
  }, [designImages])

  // Reset
  const resetDemo = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    sessionIdRef.current = null
    setIsRunning(false)
    setAgentStatuses({ science: 'idle', design: 'idle', engineer: 'idle', test: 'idle' })
    setStreamedTexts({ science: '', design: '', engineer: '', test: '' })
    setActiveAgent(null)
    setCurrentIteration(0)
    setPhase('input')
    setUserInput('')
    setDesignImages({})
    setAssets({})
    setVerificationResults([])
    setPreviewUrl(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    agentStatuses,
    streamedTexts,
    activeAgent,
    currentIteration,
    isRunning,
    phase,
    userInput,
    scenario: fractionScenario,
    designImages,
    assets,
    verificationResults,
    previewUrl,
    submitInput,
    approveAndContinue,
    editAndContinue,
    resetDemo,
    regenerateImage,
  }
}

export { OrchestrationContext }
