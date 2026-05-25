import { useState } from 'react'
import { Send } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function InputBar() {
  const { submitInput, phase } = useOrchestration()
  const [input, setInput] = useState(
    'Generate an interactive fraction comparison manipulative for Grade 3-4 students. Should support bar model and pie model with adjustable numerator/denominator.'
  )

  const handleSubmit = () => {
    if (!input.trim()) return
    submitInput(input.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (phase !== 'input') return null

  return (
    <div className="p-2">
      <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the interactive manipulative you want to generate..."
          className="w-full p-4 bg-transparent text-[14px] text-text-primary placeholder-text-muted resize-none outline-none min-h-[100px] leading-relaxed"
          rows={3}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-surface-alt">
          <span className="text-[12px] text-text-muted">
            Press Enter to submit, Shift+Enter for new line
          </span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Send size={14} />
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}
