import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getRole, type Role } from '../../lib/session'

interface RequireRoleProps {
  role: Role
  children: ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const currentRole = getRole()
  if (currentRole !== role) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
