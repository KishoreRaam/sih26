import type { DomainId } from './competencyDomains'
import { FEATURED_OFFICER_ID, officers, type Officer } from './officers'

export type BannerVariant = 'teal' | 'coral' | 'violet' | 'amber' | 'forest' | 'slate' | 'rose' | 'sky'

export interface Course {
  id: string
  code: string
  title: string
  provider: string
  format: string
  domainId: DomainId
  modulesTotal: number
  bannerVariant: BannerVariant
}

export const courses: Course[] = [
  {
    id: 'sta-101',
    code: 'STA-101',
    title: 'Applied Statistical Computing for Official Statistics',
    provider: 'iGOT Karmayogi',
    format: '6 hours · Self-paced',
    domainId: 'statistical',
    modulesTotal: 6,
    bannerVariant: 'teal',
  },
  {
    id: 'sta-204',
    code: 'STA-204',
    title: 'Foundations of Estimation Theory and Sampling Variance',
    provider: 'iGOT Karmayogi',
    format: '8 hours · Instructor-led',
    domainId: 'statistical',
    modulesTotal: 5,
    bannerVariant: 'coral',
  },
  {
    id: 'tec-110',
    code: 'TEC-110',
    title: 'Machine Learning Foundations for Public Sector Analytics',
    provider: 'iGOT Karmayogi',
    format: '10 hours · Self-paced',
    domainId: 'technical',
    modulesTotal: 8,
    bannerVariant: 'violet',
  },
  {
    id: 'tec-118',
    code: 'TEC-118',
    title: 'Automating Data Pipelines with Python and R',
    provider: 'iGOT Karmayogi',
    format: '6 hours · Self-paced',
    domainId: 'technical',
    modulesTotal: 5,
    bannerVariant: 'amber',
  },
  {
    id: 'gov-105',
    code: 'GOV-105',
    title: 'Data Privacy and Security in Digital Governance',
    provider: 'iGOT Karmayogi',
    format: '5 hours · Self-paced',
    domainId: 'governance',
    modulesTotal: 5,
    bannerVariant: 'forest',
  },
  {
    id: 'gov-112',
    code: 'GOV-112',
    title: 'GIGW Standards for Digital Service Delivery',
    provider: 'iGOT Karmayogi',
    format: '4 hours · Instructor-led',
    domainId: 'governance',
    modulesTotal: 4,
    bannerVariant: 'slate',
  },
  {
    id: 'beh-103',
    code: 'BEH-103',
    title: 'Ethical AI and Responsible Decision-Making in Government',
    provider: 'iGOT Karmayogi',
    format: '6 hours · Self-paced',
    domainId: 'behavioural',
    modulesTotal: 5,
    bannerVariant: 'rose',
  },
  {
    id: 'beh-107',
    code: 'BEH-107',
    title: 'Stakeholder Communication for Statistical Officers',
    provider: 'iGOT Karmayogi',
    format: '3 hours · Self-paced',
    domainId: 'behavioural',
    modulesTotal: 3,
    bannerVariant: 'sky',
  },
]

export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed'

export interface CourseAssignment {
  officerId: string
  courseId: string
  status: AssignmentStatus
  percentComplete: number
  modulesCompleted: number
  dueDate: string
}

export interface CourseAssignmentDetail extends CourseAssignment {
  course: Course
}

export interface CourseAssignmentFullDetail extends CourseAssignmentDetail {
  officer: Officer
}

// Hand-authored so the featured officer's Courses page, dashboard, and profile all tell
// one coherent, checkable story: 3 completed, 1 in progress, 1 not yet started.
const ROHIT_ASSIGNMENTS: CourseAssignment[] = [
  {
    officerId: FEATURED_OFFICER_ID,
    courseId: 'sta-101',
    status: 'completed',
    percentComplete: 100,
    modulesCompleted: 6,
    dueDate: '2026-07-15',
  },
  {
    officerId: FEATURED_OFFICER_ID,
    courseId: 'tec-110',
    status: 'completed',
    percentComplete: 100,
    modulesCompleted: 8,
    dueDate: '2026-08-01',
  },
  {
    officerId: FEATURED_OFFICER_ID,
    courseId: 'gov-105',
    status: 'completed',
    percentComplete: 100,
    modulesCompleted: 5,
    dueDate: '2026-08-20',
  },
  {
    officerId: FEATURED_OFFICER_ID,
    courseId: 'tec-118',
    status: 'in_progress',
    percentComplete: 60,
    modulesCompleted: 3,
    dueDate: '2026-10-05',
  },
  {
    officerId: FEATURED_OFFICER_ID,
    courseId: 'beh-103',
    status: 'not_started',
    percentComplete: 0,
    modulesCompleted: 0,
    dueDate: '2026-11-10',
  },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Fixed anchor (not Date.now()) so due dates stay stable across reloads and builds.
const REFERENCE_DATE_MS = new Date('2026-09-01T00:00:00Z').getTime()
const DAY_MS = 86400000

function generateOfficerAssignments(officerId: string): CourseAssignment[] {
  const rand = mulberry32(hashString(`${officerId}:courses`))
  const indices = new Set<number>()
  while (indices.size < 3) {
    indices.add(Math.floor(rand() * courses.length))
  }

  return Array.from(indices).map((index) => {
    const course = courses[index]
    const statusRoll = rand()
    const status: AssignmentStatus =
      statusRoll < 0.35 ? 'completed' : statusRoll < 0.75 ? 'in_progress' : 'not_started'
    const percentComplete =
      status === 'completed' ? 100 : status === 'not_started' ? 0 : Math.round(20 + rand() * 60)
    const modulesCompleted = Math.round((percentComplete / 100) * course.modulesTotal)
    const dueOffsetDays = Math.round(-20 + rand() * 90)
    const dueDate = new Date(REFERENCE_DATE_MS + dueOffsetDays * DAY_MS).toISOString().slice(0, 10)

    return {
      officerId,
      courseId: course.id,
      status,
      percentComplete,
      modulesCompleted,
      dueDate,
    }
  })
}

const assignments: CourseAssignment[] = [...ROHIT_ASSIGNMENTS]

for (const officer of officers) {
  if (officer.id === FEATURED_OFFICER_ID) continue
  assignments.push(...generateOfficerAssignments(officer.id))
}

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId)
}

export function getOfficerCourseAssignments(officerId: string): CourseAssignmentDetail[] {
  return assignments
    .filter((assignment) => assignment.officerId === officerId)
    .map((assignment) => ({ ...assignment, course: getCourseById(assignment.courseId)! }))
}

export function getAllAssignmentsWithDetails(): CourseAssignmentFullDetail[] {
  return assignments.map((assignment) => ({
    ...assignment,
    course: getCourseById(assignment.courseId)!,
    officer: officers.find((officer) => officer.id === assignment.officerId)!,
  }))
}

export function filterCourseAssignments(
  items: CourseAssignmentFullDetail[],
  filters: { departmentId?: string; courseId?: string; status?: AssignmentStatus },
): CourseAssignmentFullDetail[] {
  return items.filter((item) => {
    if (filters.departmentId && item.officer.departmentId !== filters.departmentId) return false
    if (filters.courseId && item.courseId !== filters.courseId) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })
}
