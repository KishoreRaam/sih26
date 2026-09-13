import { useState, type ReactNode } from 'react'
import { LeftNav } from './LeftNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  breadcrumb: string[]
  activeNavId: string
  activeChildId?: string
  onNavSelect: (id: string, childId?: string) => void
  children: ReactNode
}

export function AppShell({ breadcrumb, activeNavId, activeChildId, onNavSelect, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <TopBar breadcrumb={breadcrumb} />
      <div className="flex min-h-0 flex-1">
        <LeftNav
          activeId={activeNavId}
          activeChildId={activeChildId}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onSelect={onNavSelect}
        />
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg">
          <div className="mx-auto max-w-[1440px] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
