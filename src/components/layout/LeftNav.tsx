import { useState } from 'react'
import {
  CaretDown,
  CaretLineLeft,
  CaretLineRight,
  ChartBar,
  ClipboardText,
  CloudArrowUp,
  FileText,
  GearSix,
  GraduationCap,
  MagnifyingGlass,
  Sparkle,
  SquaresFour,
  Target,
  UsersThree,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { navGroups } from '../../mockData'

const iconByItemId: Record<string, Icon> = {
  overview: SquaresFour,
  diagnostics: Target,
  upload: CloudArrowUp,
  generate: Sparkle,
  quiz: ClipboardText,
  dashboard: ChartBar,
  recommendations: GraduationCap,
  officers: UsersThree,
  reports: FileText,
  audit: MagnifyingGlass,
  settings: GearSix,
}

interface LeftNavProps {
  activeId: string
  activeChildId?: string
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelect: (id: string, childId?: string) => void
}

export function LeftNav({ activeId, activeChildId, collapsed, onToggleCollapsed, onSelect }: LeftNavProps) {
  const [expandedId, setExpandedId] = useState<string | null>('diagnostics')

  return (
    <nav
      className="flex h-full shrink-0 flex-col overflow-y-auto border-r border-border bg-surface transition-[width] duration-150"
      style={{ width: collapsed ? 64 : 256 }}
      aria-label="Primary"
    >
      <div className="flex-1 py-4" style={{ paddingInline: collapsed ? 8 : 12 }}>
        {navGroups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-micro font-semibold uppercase tracking-wide text-text-muted">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const ItemIcon = iconByItemId[item.id]
                const hasChildren = !!item.children?.length
                const isExpanded = expandedId === item.id
                const isActive = item.id === activeId && !hasChildren
                const isParentActive = hasChildren && item.id === activeId

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChildren) {
                          const nowExpanding = !isExpanded
                          setExpandedId(nowExpanding ? item.id : null)
                          if (nowExpanding) onSelect(item.id, item.children![0].id)
                        } else {
                          onSelect(item.id)
                        }
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-body transition-colors ${
                        isActive || isParentActive
                          ? 'bg-primary-tint text-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                      }`}
                    >
                      <ItemIcon
                        size={18}
                        weight={isActive || isParentActive ? 'fill' : 'regular'}
                        className="shrink-0"
                      />
                      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                      {!collapsed && hasChildren && (
                        <CaretDown
                          size={12}
                          className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {!collapsed && hasChildren && isExpanded && (
                      <ul className="mt-1 space-y-0.5 border-l border-border pl-4">
                        {item.children!.map((child) => {
                          const ChildIcon = iconByItemId[child.id]
                          const isChildActive = item.id === activeId && child.id === activeChildId
                          return (
                            <li key={child.id}>
                              <button
                                type="button"
                                onClick={() => onSelect(item.id, child.id)}
                                className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-1.5 text-caption transition-colors ${
                                  isChildActive
                                    ? 'bg-primary-tint text-primary font-medium'
                                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                }`}
                              >
                                <ChildIcon
                                  size={14}
                                  weight={isChildActive ? 'fill' : 'regular'}
                                  className="shrink-0"
                                />
                                <span className="truncate">{child.label}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="flex w-full items-center justify-center gap-2 rounded-sm px-3 py-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary"
        >
          {collapsed ? <CaretLineRight size={18} /> : <CaretLineLeft size={18} />}
          {!collapsed && <span className="text-caption">Collapse</span>}
        </button>
      </div>
    </nav>
  )
}
