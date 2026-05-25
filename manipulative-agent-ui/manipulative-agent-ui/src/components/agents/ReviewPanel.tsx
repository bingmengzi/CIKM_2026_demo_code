import { useState } from 'react'
import { Check, Pencil, ChevronRight, ImageIcon, Send } from 'lucide-react'
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
    <div className="animate-fade-in-up">
      <div className="border-2 border-accent/25 rounded-xl bg-accent-light/40 p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center animate-breathe">
            <ChevronRight size={14} className="text-accent" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-accent">
            Checkpoint — Review {agentLabels[activeAgent]} Output
          </span>
        </div>

        <p className="text-[14px] text-text-secondary mb-4 ml-9">
          {agentHints[activeAgent] || 'Review the agent output and approve to continue.'}
        </p>

        {!isEditing ? (
          <div className="flex items-center gap-3 flex-wrap ml-9">
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success hover:bg-success/90 text-white text-[13px] font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <Check size={14} strokeWidth={2.5} />
              Approve & Continue
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-surface-hover text-text-secondary text-[13px] font-semibold transition-all border border-border shadow-sm"
            >
              <Pencil size={14} />
              Provide Feedback
            </button>
            {activeAgent === 'design' && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
                <ImageIcon size={12} />
                Edit prompts in Design/Assets tabs →
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-3 ml-9">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback or modification request..."
              className="w-full p-3 bg-white border border-border rounded-lg text-[13px] text-text-primary placeholder-text-muted resize-none outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 min-h-[70px] transition-all"
              rows={2}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                disabled={!feedback.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-[13px] font-semibold transition-all shadow-sm"
              >
                <Send size={14} />
                Submit Feedback
              </button>
              <button
                onClick={() => { setIsEditing(false); setFeedback('') }}
                className="px-4 py-2.5 rounded-lg text-text-muted hover:text-text-secondary text-[13px] font-medium transition-colors"
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
