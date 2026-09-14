import { SignOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
import { org, session } from '../../mockData'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function SettingsScreen() {
  const navigate = useNavigate()

  function switchRole() {
    clearRole()
    navigate('/login')
  }

  return (
    <div className="card-lift max-w-md rounded-sm border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-body font-semibold text-primary">
          {initials(session.name)}
        </span>
        <div>
          <p className="text-h2 font-semibold text-text-primary">{session.name}</p>
          <p className="text-caption text-text-secondary">{session.role}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-caption text-text-muted">Organization</p>
        <p className="mt-0.5 text-body text-text-primary">
          {org.ministry} · {org.division}
        </p>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-caption text-text-muted">Session</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="inline-flex w-fit items-center rounded-full bg-primary-tint px-2 py-0.5 text-micro font-medium text-primary">
            Coordinator (Admin)
          </span>
          <button
            type="button"
            onClick={switchRole}
            className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <SignOut size={14} />
            Switch role
          </button>
        </div>
      </div>
    </div>
  )
}
