import { useState, useEffect } from 'react'
import { Paintbrush, ImageIcon, Eye, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { DesignTab } from '../preview/DesignTab'
import { AssetsTab } from '../preview/AssetsTab'
import { PreviewTab } from '../preview/PreviewTab'
import { VerifyTab } from '../preview/VerifyTab'
import type { PreviewTab as PreviewTabType } from '@/types'

const tabs: { id: PreviewTabType; label: string; icon: React.ReactNode }[] = [
  { id: 'design', label: 'Design', icon: <Paintbrush size={13} /> },
  { id: 'assets', label: 'Assets', icon: <ImageIcon size={13} /> },
  { id: 'preview', label: 'Preview', icon: <Eye size={13} /> },
  { id: 'verify', label: 'Verify', icon: <ShieldCheck size={13} /> },
]

export function RightPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabType>('design')
  const { activeAgent, agentStatuses } = useOrchestration()

  // Auto-switch tab based on active agent
  useEffect(() => {
    if (activeAgent === 'design' || agentStatuses.design === 'awaiting_review') {
      setActiveTab('design')
    } else if (activeAgent === 'engineer' || agentStatuses.engineer === 'awaiting_review') {
      setActiveTab('preview')
    } else if (activeAgent === 'test') {
      setActiveTab('verify')
    }
  }, [activeAgent, agentStatuses.design, agentStatuses.engineer])

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border">
      {/* Tab bar */}
      <div className="h-10 flex items-center px-2 border-b border-border shrink-0 gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-text-primary'
                : 'text-text-muted hover:text-text-secondary hover:bg-background/50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'assets' && <AssetsTab />}
        {activeTab === 'preview' && <PreviewTab />}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </div>
  )
}
