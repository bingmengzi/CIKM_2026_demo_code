import { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function DesignTab() {
  const { agentStatuses, designImages, regenerateImage } = useOrchestration()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const isVisible = agentStatuses.design !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-agent-design-bg flex items-center justify-center">
            <span className="text-2xl opacity-40">🎨</span>
          </div>
          <p className="font-medium">Design mockups will appear here</p>
          <p className="text-[12px] text-text-muted mt-1">when Instructional Design Agent runs</p>
        </div>
      </div>
    )
  }

  const images = Object.entries(designImages)

  if (images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="flex items-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-agent-design" />
          <span>Generating design images...</span>
        </div>
      </div>
    )
  }

  const handleRegenerate = async (imageId: string) => {
    const prompt = prompts[imageId] || designImages[imageId]?.prompt || ''
    if (!prompt) return
    setRegenerating(imageId)
    await regenerateImage(imageId, prompt)
    setRegenerating(null)
    setEditingId(null)
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wide">
          UI Design Mockups
        </h3>
        {agentStatuses.design === 'thinking' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-agent-design">
            <Loader2 size={11} className="animate-spin" />
            Generating
            <span className="text-text-muted font-medium">{images.length} ready</span>
          </span>
        )}
      </div>
      {images.map(([id, img], idx) => (
        <div
          key={id}
          className="rounded-xl border border-border-light bg-surface-alt overflow-hidden shadow-sm animate-image-arrive"
          style={{ animationDelay: `${idx * 120}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="relative">
            <img
              src={img.url}
              alt={id}
              className="w-full h-auto object-cover"
            />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/90 text-text-primary shadow-sm backdrop-blur-sm">
              {id.replace('_', ' ')}
            </span>
            {regenerating === id && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <Loader2 size={28} className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="p-3.5">
            {editingId === id ? (
              <div className="space-y-2.5">
                <textarea
                  value={prompts[id] ?? img.prompt}
                  onChange={(e) => setPrompts({ ...prompts, [id]: e.target.value })}
                  className="w-full p-3 bg-background border border-border rounded-lg text-[12px] text-text-primary resize-none outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 min-h-[60px]"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerate(id)}
                    disabled={regenerating !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-accent-light text-accent font-semibold hover:bg-accent/15 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] text-text-secondary line-clamp-2 flex-1 leading-relaxed">
                  {img.prompt}
                </p>
                <button
                  onClick={() => setEditingId(id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] text-text-muted hover:text-accent hover:bg-accent-light font-medium transition-all"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
