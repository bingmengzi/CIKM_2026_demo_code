import { useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function PreviewTab() {
  const { agentStatuses, currentIteration, previewUrl: dynamicUrl } = useOrchestration()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isVisible = agentStatuses.engineer !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-agent-engineer-bg flex items-center justify-center">
            <span className="text-2xl opacity-40">▶</span>
          </div>
          <p className="font-medium">Live preview will appear here</p>
          <p className="text-[12px] text-text-muted mt-1">after Engineering Agent generates code</p>
        </div>
      </div>
    )
  }

  const previewUrl = dynamicUrl || null

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0 bg-surface-alt">
          <span className="text-[13px] text-text-secondary font-medium">
            {currentIteration > 0 ? `Iteration v${currentIteration}` : 'Generating...'}
          </span>
          {previewUrl && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-text-muted hover:text-text-primary hover:bg-background font-medium transition-all"
            >
              <Maximize2 size={13} />
              Fullscreen
            </button>
          )}
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-hidden bg-background">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Manipulative Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-full max-w-[280px] mx-auto space-y-3">
                  <div className="h-6 rounded-lg bg-border-light animate-shimmer" />
                  <div className="h-32 rounded-xl bg-border-light animate-shimmer" style={{ animationDelay: '0.3s' }} />
                  <div className="h-6 rounded-lg bg-border-light animate-shimmer w-2/3" style={{ animationDelay: '0.6s' }} />
                </div>
                <p className="text-[13px] text-text-muted mt-4">Building preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium transition-colors backdrop-blur"
          >
            <X size={16} />
            Close
          </button>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Manipulative Preview Fullscreen"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </>
  )
}
