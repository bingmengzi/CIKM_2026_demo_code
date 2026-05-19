import { useState } from 'react'
import { Check, Pencil, ChevronRight, ImageIcon } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

const agentLabels: Record<string, string> = {
  science: 'Learning Science Agent',
  design: 'Instructional Design Agent',
  engineer: 'Engineering Agent',
  test: 'Testing Agent',
}

const agentHints: Record<string, string> = {
  science: 'Review the activity design plan. You can modify learning goals, interaction models, or add/remove activities.',
  design: 'Review generated designs and assets. You can edit image prompts in the Design/Assets tabs on the right panel.',
  engineer: 'Review the generated code in the Preview tab. Check if the interaction logic matches the design.',
}

export function ReviewPanel() {
  const { phase, activeAgent, approveAndContinue, editAndContinue } = useOrchestration()
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState('')

  if (phase !== 'review' || !activeAgent) return null

  const handleApprove = () => {
    setIsEditing(false)
    setFeedback('')
    approveAndContinue()
  }

  const handleEdit = () => {
    if (!feedback.trim()) return
    setIsEditing(false)
    editAndContinue(feedback.trim())
    setFeedback('')
  }

  return (
    <div className="mx-4 mb-3 animate-fade-in-up">
      <div className="border border-accent/30 rounded-lg bg-accent/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
            <ChevronRight size={12} className="text-accent" />
          </div>
          <span className="text-xs font-medium text-accent">
            Checkpoint — Review {agentLabels[activeAgent]} Output
          </span>
        </div>

        <p className="text-xs text-text-secondary mb-3">
          {agentHints[activeAgent] || 'Review the agent output and approve to continue.'}
        </p>

        {!isEditing ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/20 hover:bg-success/30 text-success text-xs font-medium transition-colors"
            >
              <Check size={12} />
              Approve & Continue
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface hover:bg-surface-hover text-text-secondary text-xs font-medium transition-colors border border-border"
            >
              <Pencil size={12} />
              Provide Feedback
            </button>
            {activeAgent === 'design' && (
              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                <ImageIcon size={10} />
                Edit prompts in Design/Assets tabs →
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback or modification request..."
              className="w-full p-2 bg-surface border border-border rounded-md text-xs text-text-primary placeholder-text-muted resize-none outline-none focus:border-accent min-h-[60px]"
              rows={2}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                disabled={!feedback.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-xs font-medium transition-colors"
              >
                <SendIcon size={12} />
                Submit Feedback
              </button>
              <button
                onClick={() => { setIsEditing(false); setFeedback('') }}
                className="px-3 py-1.5 rounded-md text-text-muted hover:text-text-secondary text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SendIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  )
}
