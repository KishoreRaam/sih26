import { SignOut, Target } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'

export type OfficerSection = 'dashboard' | 'courses' | 'connect'

interface OfficerTopBarProps {
  activeSection: OfficerSection
  onSelectSection: (section: OfficerSection) => void
}

const officerSections: { id: OfficerSection; label: string }[] = [
  { id: 'dashboard', label: 'My Dashboard' },
  { id: 'courses', label: 'My Courses' },
  { id: 'connect', label: 'Connect' },
]

export function OfficerTopBar({ activeSection, onSelectSection }: OfficerTopBarProps) {
  const navigate = useNavigate()
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!

  function switchRole() {
    clearRole()
    navigate('/login')
  }

  return (
    <header className="border-b border-primary-hover bg-primary text-white">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
            <Target size={18} weight="bold" />
          </span>
          <div className="leading-tight">
            <div className="text-h2 font-semibold">MoSPI · NSSTA</div>
            <div className="text-micro text-white/65">Officer Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-body font-medium">{officer.name}</span>
          <button
            type="button"
            onClick={switchRole}
            className="flex items-center gap-1.5 rounded-sm border border-white/25 px-3 py-1.5 text-caption font-medium transition-colors hover:bg-white/10"
          >
            <SignOut size={14} />
            Switch role
          </button>
        </div>
      </div>
      <nav className="flex gap-1 border-t border-primary-hover px-4" aria-label="Officer">
        {officerSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className={`border-b-2 px-3 py-2.5 text-body font-medium transition-colors ${
              activeSection === section.id
                ? 'border-white text-white'
                : 'border-transparent text-white/65 hover:text-white'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
