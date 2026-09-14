import { useState } from 'react'
import { MagnifyingGlass, PaperPlaneTilt, X } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, getOfficerExpertise } from '../../data/competencyDomains'
import { departments } from '../../data/departments'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'

interface Message {
  id: string
  sender: 'me' | 'them'
  text: string
  timestamp: string
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Simulated presence only — no real online/offline signal exists in this prototype.
function isAvailable(officerId: string): boolean {
  let sum = 0
  for (let i = 0; i < officerId.length; i++) sum += officerId.charCodeAt(i)
  return sum % 3 !== 0
}

const seededThreads: Record<string, Message[]> = {
  'ananya-krishnan': [
    {
      id: 'seed-1',
      sender: 'them',
      text: 'Hi Rohit, saw your note on the sampling variance estimator - happy to walk through it if useful.',
      timestamp: '2026-09-10T10:05:00+05:30',
    },
    {
      id: 'seed-2',
      sender: 'me',
      text: 'That would help a lot, thanks! I am stuck on the Neyman allocation part.',
      timestamp: '2026-09-10T10:12:00+05:30',
    },
  ],
}

export function OfficerConnect() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Record<string, Message[]>>(seededThreads)
  const [draft, setDraft] = useState('')

  const directory = officers
    .filter((o) => o.id !== officer.id)
    .map((o) => ({ officer: o, expertise: getOfficerExpertise(o.id, CURRENT_CYCLE_ID) }))
    .filter((entry) => {
      const query = search.trim().toLowerCase()
      if (query.length === 0) return true
      return (
        entry.officer.name.toLowerCase().includes(query) ||
        (entry.expertise?.domain.name.toLowerCase().includes(query) ?? false)
      )
    })

  const selectedEntry = selectedId ? directory.find((entry) => entry.officer.id === selectedId) : undefined
  const selectedOfficerRaw = selectedId ? officers.find((o) => o.id === selectedId) : undefined
  const activeThread = selectedId ? (threads[selectedId] ?? []) : []

  function sendMessage() {
    if (!selectedId || draft.trim().length === 0) return
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: 'me',
      text: draft.trim(),
      timestamp: new Date().toISOString(),
    }
    setThreads((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newMessage] }))
    setDraft('')
  }

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">Connect</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        Find officers by name or area of expertise and ask them a question.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2">
        <MagnifyingGlass size={16} className="text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or expertise..."
          className="w-full bg-transparent text-body text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {selectedId && selectedOfficerRaw && (
        <div className="mt-4 rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                {initials(selectedOfficerRaw.name)}
              </span>
              <div>
                <p className="text-body font-medium text-text-primary">{selectedOfficerRaw.name}</p>
                {selectedEntry?.expertise && (
                  <p className="text-micro text-text-muted">
                    {selectedEntry.expertise.domain.name} · {selectedEntry.expertise.score}%
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close conversation"
              className="flex size-7 items-center justify-center rounded-sm text-text-muted hover:bg-surface-alt hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-sm bg-surface-alt p-3">
            {activeThread.length === 0 ? (
              <p className="text-caption text-text-muted">Start a conversation with {selectedOfficerRaw.name.split(' ')[0]}.</p>
            ) : (
              activeThread.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-sm px-3 py-2 text-caption ${
                    message.sender === 'me'
                      ? 'ml-auto bg-primary text-white'
                      : 'bg-surface text-text-primary'
                  }`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              placeholder="Ask a question..."
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-caption text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={draft.trim().length === 0}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PaperPlaneTilt size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {directory.map(({ officer: entryOfficer, expertise }) => {
          const available = isAvailable(entryOfficer.id)
          return (
            <div key={entryOfficer.id} className="card-lift rounded-sm border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                    {initials(entryOfficer.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-body font-medium text-text-primary">{entryOfficer.name}</p>
                    <p className="text-caption text-text-muted">
                      {departments.find((d) => d.id === entryOfficer.departmentId)?.code}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${
                    available ? 'bg-strong-tint text-strong' : 'bg-insufficient-tint text-insufficient'
                  }`}
                >
                  {available ? 'Available' : 'Offline'}
                </span>
              </div>

              {expertise && (
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                  {expertise.domain.name} · {expertise.score}%
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedId(entryOfficer.id)}
                className="mt-4 w-full rounded-sm border border-border px-3 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-alt"
              >
                Message
              </button>
            </div>
          )
        })}
        {directory.length === 0 && (
          <p className="text-caption text-text-muted">No officers match "{search}".</p>
        )}
      </div>
    </div>
  )
}
