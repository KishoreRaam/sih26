export type Role = 'officer' | 'admin'

const STORAGE_KEY = 'sih26.role'

export function getRole(): Role | null {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored === 'officer' || stored === 'admin' ? stored : null
}

export function setRole(role: Role): void {
  sessionStorage.setItem(STORAGE_KEY, role)
}

export function clearRole(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
