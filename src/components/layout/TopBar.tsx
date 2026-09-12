import { CaretRight, Target } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { org, session } from '../../mockData'

interface TopBarProps {
  breadcrumb: string[]
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TopBar({ breadcrumb }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-primary-hover bg-primary px-4 text-white">
      <div className="flex items-center gap-6 min-w-0">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 rounded-sm focus-visible:outline-white">
          <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
            <Target size={18} weight="bold" />
          </span>
          <div className="leading-tight">
            <div className="text-h2 font-semibold">MoSPI · NSSTA</div>
            <div className="text-micro text-white/65">{org.productName}</div>
          </div>
        </Link>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-caption text-white/75 md:flex">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <CaretRight size={12} className="text-white/40" />}
              <span className={i === breadcrumb.length - 1 ? 'text-white' : undefined}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-body font-medium">{session.name}</div>
          <div className="text-micro text-white/65">{session.role}</div>
        </div>
        <span className="flex size-8 items-center justify-center rounded-sm bg-white/15 text-caption font-semibold">
          {initials(session.name)}
        </span>
      </div>
    </header>
  )
}
