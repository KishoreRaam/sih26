import { getOfficerOverallScore, isOfficerFullyAssessed, CURRENT_CYCLE_ID } from './competencyDomains'
import { type Officer, officers } from './officers'
import { MODERATE_MIN, STRONG_MIN } from './thresholds'

export interface Department {
  id: string
  code: string
  name: string
  nextReviewDate: string
}

export const departments: Department[] = [
  { id: 'fod', code: 'FOD', name: 'Field Operations Division', nextReviewDate: '2026-11-10' },
  { id: 'sdm', code: 'SDM', name: 'Survey Design & Methodology', nextReviewDate: '2026-10-27' },
  { id: 'dpa', code: 'DPA', name: 'Data Processing & Analytics', nextReviewDate: '2026-12-01' },
  { id: 'rtcs', code: 'RTC-S', name: 'Regional Training Centre – South', nextReviewDate: '2026-11-17' },
  { id: 'dgc', code: 'DGC', name: 'Digital Governance Cell', nextReviewDate: '2026-10-13' },
  { id: 'qaw', code: 'QAW', name: 'Quality Assurance Wing', nextReviewDate: '2026-12-08' },
]

export type DepartmentStatus = 'on_track' | 'at_risk' | 'critical'

export function getDepartmentOfficers(departmentId: string): Officer[] {
  return officers.filter((officer) => officer.departmentId === departmentId)
}

export function getDepartmentAvgScore(departmentId: string): number {
  const deptOfficers = getDepartmentOfficers(departmentId)
  if (deptOfficers.length === 0) return 0
  const scores = deptOfficers.map((officer) => getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID))
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

export function getDepartmentStatus(departmentId: string): DepartmentStatus {
  const avg = getDepartmentAvgScore(departmentId)
  if (avg >= STRONG_MIN) return 'on_track'
  if (avg >= MODERATE_MIN) return 'at_risk'
  return 'critical'
}

export function getDepartmentAssessedFraction(departmentId: string): { assessed: number; total: number } {
  const deptOfficers = getDepartmentOfficers(departmentId)
  const assessed = deptOfficers.filter((officer) => isOfficerFullyAssessed(officer.id, CURRENT_CYCLE_ID)).length
  return { assessed, total: deptOfficers.length }
}
