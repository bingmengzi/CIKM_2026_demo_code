import { ThreePanelLayout } from './components/layout/ThreePanelLayout'
import { OrchestrationContext, useOrchestrationProvider } from './hooks/useAgentOrchestration'

export default function App() {
  const orchestration = useOrchestrationProvider()

  return (
    <OrchestrationContext.Provider value={orchestration}>
      <ThreePanelLayout />
    </OrchestrationContext.Provider>
  )
}
