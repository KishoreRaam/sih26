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
  return (
    <div className="max-w-md rounded-sm border border-border bg-surface p-6">
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
    </div>
  )
}
