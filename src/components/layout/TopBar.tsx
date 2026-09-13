import { Bell, CaretRight, MagnifyingGlass, SignOut, Target } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
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
  const navigate = useNavigate()

  function switchRole() {
    clearRole()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-primary-hover bg-primary px-4 text-white">
      <div className="flex min-w-0 items-center gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-white">
          <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
            <Target size={18} weight="bold" />
          </span>
          <div className="leading-tight">
            <div className="text-h2 font-semibold">MoSPI · NSSTA</div>
            <div className="text-micro text-white/65">{org.productName}</div>
          </div>
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-1.5 text-caption text-white/75 md:flex"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <CaretRight size={12} className="text-white/40" />}
              <span className={i === breadcrumb.length - 1 ? 'text-white' : undefined}>{crumb}</span>
            </span>
          ))}
        </nav>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-caption text-white/70">
          <MagnifyingGlass size={14} />
          <span className="truncate">Search officers, reports, questions…</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent" />
        </button>

        <button
          type="button"
          onClick={switchRole}
          className="hidden items-center gap-1.5 rounded-sm border border-white/25 px-3 py-1.5 text-caption font-medium transition-colors hover:bg-white/10 sm:flex"
        >
          <SignOut size={14} />
          Switch role
        </button>

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
