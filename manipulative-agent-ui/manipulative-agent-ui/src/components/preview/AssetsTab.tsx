import { useState } from 'react'
import { RefreshCw, X, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function AssetsTab() {
  const { agentStatuses, assets, regenerateImage } = useOrchestration()
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const isVisible = agentStatuses.design === 'done' || agentStatuses.design === 'awaiting_review'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-agent-design-bg flex items-center justify-center">
            <span className="text-2xl opacity-40">🖼</span>
          </div>
          <p className="font-medium">Assets will appear here</p>
          <p className="text-[12px] text-text-muted mt-1">after design generation completes</p>
        </div>
      </div>
    )
  }

  const assetEntries = Object.entries(assets)

  if (assetEntries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="flex items-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-agent-design" />
          <span>Generating assets...</span>
        </div>
      </div>
    )
  }

  const grouped = [1, 2, 3].map((actId) => ({
    activityId: actId,
    items: assetEntries.filter(([_, a]) => a.activity_id === actId),
  })).filter((g) => g.items.length > 0)

  const selectedAsset = selectedAssetId ? assets[selectedAssetId] : null

  const handleRegenerate = async () => {
    if (!selectedAssetId || !editPrompt.trim()) return
    setRegenerating(true)
    await regenerateImage(selectedAssetId, editPrompt.trim())
    setRegenerating(false)
    setSelectedAssetId(null)
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wide">
          Generated Assets
        </h3>
        {agentStatuses.design === 'thinking' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-agent-design">
            <Loader2 size={11} className="animate-spin" />
            <span>{assetEntries.length} assets ready</span>
          </span>
        )}
      </div>

      {grouped.map((group) => (
        <div key={group.activityId}>
          <h4 className="text-[14px] font-semibold text-text-secondary mb-3">
            Activity {group.activityId}
          </h4>
          <div className="grid grid-cols-3 gap-2.5">
            {group.items.map(([id, asset], idx) => (
              <div
                key={id}
                onClick={() => { setSelectedAssetId(id); setEditPrompt(asset.prompt) }}
                className="rounded-lg border border-border-light overflow-hidden cursor-pointer hover:border-accent/40 hover:shadow-sm transition-all animate-image-arrive"
                style={{ animationDelay: `${idx * 70}ms`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <img src={asset.url} alt={asset.name} className="w-full h-18 object-cover" />
                <div className="p-2">
                  <p className="text-[11px] text-text-secondary truncate font-medium">{asset.name}</p>
                  <span className="text-[10px] text-text-muted capitalize">{asset.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Asset detail modal */}
      {selectedAsset && selectedAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAssetId(null)}>
          <div className="bg-white rounded-xl border border-border p-5 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[15px] font-bold text-text-primary">{selectedAsset.name}</h4>
              <button onClick={() => setSelectedAssetId(null)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>
            <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-44 object-cover rounded-lg mb-4" />
            <label className="text-[12px] text-text-muted font-semibold block mb-1.5">Generation Prompt:</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-[13px] text-text-primary resize-none outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 min-h-[70px] mb-3"
              rows={3}
            />
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-light text-accent text-[13px] font-semibold hover:bg-accent/15 transition-colors disabled:opacity-40"
            >
              {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Regenerate Asset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
