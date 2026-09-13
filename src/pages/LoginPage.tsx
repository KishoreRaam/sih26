import { GraduationCap, ShieldCheck } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { setRole, type Role } from '../lib/session'
import { org } from '../mockData'

export function LoginPage() {
  const navigate = useNavigate()

  function continueAs(role: Role, destination: string) {
    setRole(role)
    navigate(destination)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
            {org.ministry} · {org.division}
          </p>
          <h1 className="mt-2 text-title font-semibold text-text-primary">{org.productName}</h1>
          <p className="mt-2 text-body text-text-secondary">Choose how you&apos;d like to continue.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => continueAs('officer', '/officer')}
            className="card-lift flex flex-col items-start gap-3 rounded-sm border border-border bg-surface p-6 text-left transition-colors hover:bg-surface-alt"
          >
            <span className="flex size-11 items-center justify-center rounded-sm bg-primary-tint text-primary">
              <GraduationCap size={22} />
            </span>
            <span className="text-h1 font-semibold text-text-primary">Continue as Officer</span>
            <span className="text-body text-text-secondary">
              View your own competency progress and recommended training.
            </span>
          </button>

          <button
            type="button"
            onClick={() => continueAs('admin', '/app')}
            className="card-lift flex flex-col items-start gap-3 rounded-sm border border-border bg-surface p-6 text-left transition-colors hover:bg-surface-alt"
          >
            <span className="flex size-11 items-center justify-center rounded-sm bg-primary-tint text-primary">
              <ShieldCheck size={22} />
            </span>
            <span className="text-h1 font-semibold text-text-primary">Continue as Coordinator (Admin)</span>
            <span className="text-body text-text-secondary">
              Review cohort progress, verification quality, and assign training.
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
