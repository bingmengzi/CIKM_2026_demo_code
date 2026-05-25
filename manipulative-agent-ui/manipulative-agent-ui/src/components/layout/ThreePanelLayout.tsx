import { Group, Panel, Separator } from 'react-resizable-panels'
import { RotateCcw, Sparkles } from 'lucide-react'
import { LeftSidebar } from './LeftSidebar'
import { CenterWorkspace } from './CenterWorkspace'
import { RightPreview } from './RightPreview'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function ThreePanelLayout() {
  const { isRunning, phase, resetDemo } = useOrchestration()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-13 flex items-center px-6 border-b border-border bg-white shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-agent-science flex items-center justify-center shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-[16px] text-text-primary tracking-tight">ManipulativeAgent</span>
            <span className="ml-3 text-[13px] text-text-muted font-medium">Multi-Agent Workbench</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {(isRunning || phase === 'complete') && (
            <button
              onClick={resetDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-surface-hover text-text-secondary hover:text-text-primary text-[13px] font-semibold transition-all border border-border hover:shadow-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main panels */}
      <div className="flex-1 flex overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize={24} minSize={20} maxSize={30}>
            <LeftSidebar />
          </Panel>

          <Separator className="w-[1px] bg-border hover:bg-accent hover:w-[3px] transition-all cursor-col-resize" />

          <Panel defaultSize={43} minSize={28}>
            <CenterWorkspace />
          </Panel>

          <Separator className="w-[1px] bg-border hover:bg-accent hover:w-[3px] transition-all cursor-col-resize" />

          <Panel defaultSize={33} minSize={22}>
            <RightPreview />
          </Panel>
        </Group>
      </div>
    </div>
  )
}
