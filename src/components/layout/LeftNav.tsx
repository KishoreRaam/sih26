import {
  CaretLineLeft,
  CaretLineRight,
  FileText,
  GearSix,
  SquaresFour,
  Target,
  UsersThree,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { navItems } from '../../mockData'

const iconByItem: Record<string, Icon> = {
  overview: SquaresFour,
  diagnostics: Target,
  officers: UsersThree,
  reports: FileText,
  settings: GearSix,
}

interface LeftNavProps {
  activeId: string
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelect: (id: string) => void
}

export function LeftNav({ activeId, collapsed, onToggleCollapsed, onSelect }: LeftNavProps) {
  return (
    <nav
      className="flex h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-150"
      style={{ width: collapsed ? 64 : 256 }}
      aria-label="Primary"
    >
      <ul className="flex-1 space-y-1 py-4" style={{ paddingInline: collapsed ? 8 : 12 }}>
        {navItems.map((item) => {
          const ItemIcon = iconByItem[item.id]
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-body transition-colors ${
                  isActive
                    ? 'bg-primary-tint text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }`}
              >
                <ItemIcon size={18} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          )
        })}
      </ul>

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
