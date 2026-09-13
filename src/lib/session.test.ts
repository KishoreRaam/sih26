import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRole, getRole, setRole } from './session'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('sessionStorage', createMemoryStorage())
})

describe('session', () => {
  it('returns null when no role is stored', () => {
    expect(getRole()).toBeNull()
  })

  it('stores and retrieves a role', () => {
    setRole('officer')
    expect(getRole()).toBe('officer')
  })

  it('clears a stored role', () => {
    setRole('admin')
    clearRole()
    expect(getRole()).toBeNull()
  })

  it('ignores a corrupted stored value', () => {
    sessionStorage.setItem('sih26.role', 'superuser')
    expect(getRole()).toBeNull()
  })
})
