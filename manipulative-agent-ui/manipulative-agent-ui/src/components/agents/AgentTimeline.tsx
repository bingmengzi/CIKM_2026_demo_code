import { useEffect, useRef } from 'react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { AgentCard } from './AgentCard'
import { InputBar } from './InputBar'
import { ReviewPanel } from './ReviewPanel'
import type { AgentId } from '@/types'
import { Check } from 'lucide-react'

const agentOrder: AgentId[] = ['science', 'design', 'engineer', 'test']

export function AgentTimeline() {
  const { agentStatuses, streamedTexts, activeAgent, phase, userInput } = useOrchestration()
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef(true)

  // Track whether user is near the bottom — only auto-scroll when sticky
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickyRef.current = distanceFromBottom < 80
  }

  // Auto-scroll on streamed text growth or status / phase change
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !stickyRef.current) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [streamedTexts, agentStatuses, phase, activeAgent])

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {/* Input phase: show text area */}
        {phase === 'input' && <InputBar />}

        {/* Show user input as a message once submitted */}
        {userInput && phase !== 'input' && (
          <div className="rounded-xl bg-accent-light/60 border border-accent/15 p-4 shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
                <span className="text-[12px] font-bold text-accent">U</span>
              </div>
              <span className="text-[15px] font-bold text-accent">Teacher Input</span>
            </div>
            <p className="text-[15px] text-text-primary leading-relaxed ml-9">{userInput}</p>
          </div>
        )}

        {/* Agent cards */}
        {agentOrder.map((agentId) => (
          <AgentCard
            key={agentId}
            agentId={agentId}
            status={agentStatuses[agentId]}
            streamedText={streamedTexts[agentId]}
            isStreaming={activeAgent === agentId && agentStatuses[agentId] === 'thinking'}
          />
        ))}

        {/* Review panel - HITL checkpoint */}
        <ReviewPanel />

        {/* Complete state */}
        {phase === 'complete' && (
          <div className="rounded-xl bg-success-light border border-success/20 p-4 text-center animate-fade-in-up shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center animate-check-pop">
                <Check size={16} className="text-success" strokeWidth={3} />
              </div>
              <p className="text-[15px] font-semibold text-success">
                All agents completed. Interactive manipulative generated successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
