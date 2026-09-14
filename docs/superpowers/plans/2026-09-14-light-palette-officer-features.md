# Light Palette Correction + Officer Engagement Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the app's neutral/status color tokens to the precise light palette the user specified, apply the pill-badge shape convention everywhere, substantially populate `OfficerDashboard`, and add three new features: a redesigned course-catalog page, an officer-to-officer "Connect" directory with mock messaging, and an admin-facing course-progress tracker with drill-down officer profiles.

**Architecture:** Continues the existing token-driven design system (Tailwind v4 `@theme` in `src/index.css`) and the existing officer/department data layer (`src/data/*.ts`). Two new data files (`src/data/courses.ts`, plus an extension to `src/data/competencyDomains.ts`) feed six new/rewritten React components. All new data is deterministically generated with the same seeded-hash pattern already used for competency scores, except the featured officer's data, which is hand-authored for narrative coherence.

**Tech Stack:** Vite, React 19, TypeScript (strict: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`), Tailwind CSS v4, react-router-dom v7, @phosphor-icons/react, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-14-dark-retheme-and-officer-features-design.md` (despite the filename, the *current* content of this spec — after its same-day revision — specifies a **light** palette correction, not a dark theme; read the spec's §3 revision note first).

## Global Constraints

- Palette values are exact — copy the hex values in Task 1 verbatim, do not approximate.
- Brand `--color-primary`/`--color-primary-hover`/`--color-primary-tint` stay at their original locked values (`#0b3a5c` / `#092e49` / `#e4ebf1`) — only the neutral and semantic-status tokens change.
- Every semantic/status pill badge across the whole app (existing and new) uses `rounded-full`, not `rounded-sm` — this is a shape convention change, not scoped to new pages only.
- `LandingPage.tsx` is out of scope for every task in this plan — do not touch it.
- The existing 8-officer diagnostic-flow cohort and its screens (`OfficersScreen`, `DashboardScreen`, `RecommendationsScreen`, `ReportsScreen`, `UploadScreen`, `GenerateScreen`, `QuizScreen`) keep their exact current behavior — only the token-driven palette/badge-shape changes touch them, nothing else.
- New decorative course-banner colors (Task 4) may use Tailwind's stock color utilities (e.g. `from-teal-400`) — this is a narrow, spec-sanctioned exception for decorative-only illustration banners; never use stock Tailwind colors for anything that carries semantic meaning (status, score level, category identity) — those stay on the locked design-system tokens.
- All new mock data is deterministic (seeded hash, no `Math.random()`, no `Date.now()`) so the app's numbers are stable across reloads and builds.
- Officer Connect messages are React state only — no persistence, no backend.
- Commit messages follow this repo's `type: summary` convention.

---

## Task 1: Palette correction, badge-shape sweep, and legibility pass

**Files:**
- Modify: `src/index.css` (token values only)
- Modify: `src/components/admin/RejectionAuditBoard.tsx:123`
- Modify: `src/components/screens/DashboardScreen.tsx:162`
- Modify: `src/components/screens/RecommendationsScreen.tsx:72,102`
- Modify: `src/components/screens/SettingsScreen.tsx:45`

**Interfaces:** No exports change — this is a values-only/className-only edit across 5 files. No other task depends on this task's diff directly, but every later task's manual verification should be done against these corrected values.

- [ ] **Step 1: Replace the color tokens in `src/index.css`**

Replace the `/* Brand */` through `/* System... */` block (currently lines 15-45) with:

```css
  /* Brand */
  --color-primary: #0b3a5c;
  --color-primary-hover: #092e49;
  --color-primary-tint: #e4ebf1;
  --color-secondary: #45607a;
  --color-accent: #a66a00;
  --color-accent-tint: #f5ebd8;

  /* Neutrals */
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-surface-alt: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-strong: #94a3b8;
  --color-text-primary: #0f172a;
  --color-text-secondary: #1e293b;
  --color-text-muted: #64748b;

  /* Semantic: competency levels / status pills (never color-only in usage - pair with a label) */
  --color-strong: #166534;
  --color-strong-tint: #dcfce7;
  --color-moderate: #92400e;
  --color-moderate-tint: #fef3c7;
  --color-weak: #991b1b;
  --color-weak-tint: #fee2e2;
  --color-insufficient: #475569;
  --color-insufficient-tint: #f1f5f9;

  /* System (kept distinct from competency-weak on purpose) */
  --color-system-error: #991b1b;
  --color-focus-ring: #a66a00;
```

Everything else in the file (`@import`s, font/text-scale tokens, `--radius-sm`, `@layer base`, `.hero-rise`, `.grid-texture`, `.card-lift`, `.live-pulse`) is unchanged — `--color-primary` staying at its original value means `.card-lift`'s hardcoded `rgba(11, 58, 92, 0.32)` shadow and `.grid-texture`'s `%230b3a5c` dot fill are both still correct and need no edit.

- [ ] **Step 2: Badge-shape sweep — 4 files, one `rounded-sm` → `rounded-full` each**

In `src/components/admin/RejectionAuditBoard.tsx`, line 123, change:
```tsx
className={`rounded-sm px-1.5 py-0.5 text-micro font-medium ${reasonTagClass[item.rejectionReason]}`}
```
to:
```tsx
className={`rounded-full px-1.5 py-0.5 text-micro font-medium ${reasonTagClass[item.rejectionReason]}`}
```

In `src/components/screens/DashboardScreen.tsx`, line 162, change:
```tsx
<span className="rounded-sm bg-insufficient-tint px-2 py-0.5 text-micro font-medium text-insufficient">
```
to:
```tsx
<span className="rounded-full bg-insufficient-tint px-2 py-0.5 text-micro font-medium text-insufficient">
```

In `src/components/screens/RecommendationsScreen.tsx`, line 72, change:
```tsx
<span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
```
to:
```tsx
<span className="inline-flex w-fit items-center rounded-full bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
```
and line 102, change:
```tsx
className="rounded-sm border border-border bg-surface-alt px-2 py-0.5 text-caption text-text-secondary"
```
to:
```tsx
className="rounded-full border border-border bg-surface-alt px-2 py-0.5 text-caption text-text-secondary"
```

In `src/components/screens/SettingsScreen.tsx`, line 45, change:
```tsx
<span className="inline-flex w-fit items-center rounded-sm bg-primary-tint px-2 py-0.5 text-micro font-medium text-primary">
```
to:
```tsx
<span className="inline-flex w-fit items-center rounded-full bg-primary-tint px-2 py-0.5 text-micro font-medium text-primary">
```

Do not change any other `rounded-sm` usage in these files (cards, buttons, inputs, table cells stay `rounded-sm` — only the 5 badge/pill spots above change).

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit -p tsconfig.app.json` — expect clean.
Run: `npm run build` — expect exit 0.

- [ ] **Step 4: Manual legibility pass (live browser)**

Run `npm run dev`. Log in as both roles and visit every existing page, confirming text is legible against the new lighter neutrals and every badge is now a pill (fully rounded ends, not a 4px-radius rectangle):

1. `/login` — both cards legible.
2. Officer: My Dashboard, My Courses.
3. Admin: Dashboard (department status badges are pills), Officers, Reports, Settings (role badge is a pill), Verification Audit (reason tags are pills, filter dropdowns), New Assessment → all 5 steps (competency-report table's "Insufficient data" badge is a pill), Recommendations (provider tag and officer-name chips are pills).

Note anything that reads as low-contrast or visually broken in your report — this is the last general-purpose check before the new features build on top of this palette.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/admin/RejectionAuditBoard.tsx src/components/screens/DashboardScreen.tsx src/components/screens/RecommendationsScreen.tsx src/components/screens/SettingsScreen.tsx
git commit -m "fix: correct neutral/status palette and switch badges to pill shape"
```

---

## Task 2: `src/data/courses.ts` — course catalog and per-officer assignments

**Files:**
- Create: `src/data/courses.ts`
- Test: `src/data/courses.test.ts`

**Interfaces:**
- Consumes: `officers`, `type Officer` from `./officers` (existing); `taxonomyCompetencies` is not needed here — this file is independent of the competency-scoring layer.
- Produces: `type BannerVariant = 'teal' | 'coral' | 'violet' | 'amber' | 'forest' | 'slate' | 'rose' | 'sky'`; `interface Course { id: string; code: string; title: string; provider: string; format: string; domainId: DomainId; modulesTotal: number; bannerVariant: BannerVariant }` (imports `type DomainId` from `./competencyDomains`); `courses: Course[]` (8 entries); `type AssignmentStatus = 'not_started' | 'in_progress' | 'completed'`; `interface CourseAssignment { officerId: string; courseId: string; status: AssignmentStatus; percentComplete: number; modulesCompleted: number; dueDate: string }`; `interface CourseAssignmentDetail extends CourseAssignment { course: Course }`; `interface CourseAssignmentFullDetail extends CourseAssignmentDetail { officer: Officer }`; functions `getCourseById(courseId: string): Course | undefined`, `getOfficerCourseAssignments(officerId: string): CourseAssignmentDetail[]`, `getAllAssignmentsWithDetails(): CourseAssignmentFullDetail[]`, `filterCourseAssignments(items: CourseAssignmentFullDetail[], filters: { departmentId?: string; courseId?: string; status?: AssignmentStatus }): CourseAssignmentFullDetail[]`. Consumed by Task 4 (`OfficerCourses`), Task 5 (`OfficerDashboard`), Task 8 (`CourseProgressBoard`), Task 11 (`OfficerProfile`).

- [ ] **Step 1: Write the failing tests**

Create `src/data/courses.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  courses,
  filterCourseAssignments,
  getAllAssignmentsWithDetails,
  getCourseById,
  getOfficerCourseAssignments,
} from './courses'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('courses', () => {
  it('has 8 courses spanning all 4 domains', () => {
    expect(courses).toHaveLength(8)
    const domainIds = new Set(courses.map((c) => c.domainId))
    expect(domainIds).toEqual(new Set(['statistical', 'technical', 'governance', 'behavioural']))
  })

  it('has unique ids and codes', () => {
    expect(new Set(courses.map((c) => c.id)).size).toBe(8)
    expect(new Set(courses.map((c) => c.code)).size).toBe(8)
  })
})

describe('getCourseById', () => {
  it('returns the matching course', () => {
    expect(getCourseById('sta-101')?.title).toBe('Applied Statistical Computing for Official Statistics')
  })

  it('returns undefined for an unknown id', () => {
    expect(getCourseById('does-not-exist')).toBeUndefined()
  })
})

describe('getOfficerCourseAssignments (featured officer)', () => {
  it("returns Rohit's 5 hand-authored assignments with course details attached", () => {
    const result = getOfficerCourseAssignments(FEATURED_OFFICER_ID)
    expect(result).toHaveLength(5)
    result.forEach((entry) => {
      expect(entry.course.id).toBe(entry.courseId)
    })
    const completed = result.filter((entry) => entry.status === 'completed')
    const inProgress = result.filter((entry) => entry.status === 'in_progress')
    const notStarted = result.filter((entry) => entry.status === 'not_started')
    expect(completed).toHaveLength(3)
    expect(inProgress).toHaveLength(1)
    expect(notStarted).toHaveLength(1)
  })
})

describe('getOfficerCourseAssignments (generated officers)', () => {
  it('gives every non-featured officer exactly 3 assignments to distinct courses', () => {
    officers
      .filter((o) => o.id !== FEATURED_OFFICER_ID)
      .forEach((officer) => {
        const result = getOfficerCourseAssignments(officer.id)
        expect(result).toHaveLength(3)
        expect(new Set(result.map((r) => r.courseId)).size).toBe(3)
      })
  })

  it('keeps percentComplete and modulesCompleted consistent with status', () => {
    officers.forEach((officer) => {
      getOfficerCourseAssignments(officer.id).forEach((entry) => {
        if (entry.status === 'completed') expect(entry.percentComplete).toBe(100)
        if (entry.status === 'not_started') expect(entry.percentComplete).toBe(0)
        expect(entry.modulesCompleted).toBeLessThanOrEqual(entry.course.modulesTotal)
        expect(entry.modulesCompleted).toBeGreaterThanOrEqual(0)
      })
    })
  })

  it('is deterministic across repeated calls', () => {
    const first = getOfficerCourseAssignments('ananya-krishnan')
    const second = getOfficerCourseAssignments('ananya-krishnan')
    expect(first).toEqual(second)
  })
})

describe('getAllAssignmentsWithDetails', () => {
  it('returns one entry per officer-course assignment with officer and course attached', () => {
    const all = getAllAssignmentsWithDetails()
    expect(all.length).toBe(5 + (officers.length - 1) * 3)
    all.forEach((entry) => {
      expect(entry.officer.id).toBe(entry.officerId)
      expect(entry.course.id).toBe(entry.courseId)
    })
  })
})

describe('filterCourseAssignments', () => {
  const all = getAllAssignmentsWithDetails()

  it('returns everything when no filters are given', () => {
    expect(filterCourseAssignments(all, {})).toHaveLength(all.length)
  })

  it('filters by department', () => {
    const result = filterCourseAssignments(all, { departmentId: 'fod' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.officer.departmentId === 'fod')).toBe(true)
  })

  it('filters by course', () => {
    const result = filterCourseAssignments(all, { courseId: 'sta-101' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.courseId === 'sta-101')).toBe(true)
  })

  it('filters by status', () => {
    const result = filterCourseAssignments(all, { status: 'completed' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.status === 'completed')).toBe(true)
  })

  it('combines all three filters', () => {
    const result = filterCourseAssignments(all, { departmentId: 'fod', status: 'completed' })
    result.forEach((entry) => {
      expect(entry.officer.departmentId).toBe('fod')
      expect(entry.status).toBe('completed')
    })
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/courses.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `courses.ts`**

Create `src/data/courses.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/courses.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/courses.ts src/data/courses.test.ts
git commit -m "feat: add course catalog and per-officer course assignments"
```

---

## Task 3: Extend `competencyDomains.ts` — engagement for all officers + expertise helper

**Files:**
- Modify: `src/data/competencyDomains.ts` (additive — no existing export's behavior for the featured officer changes)
- Modify: `src/data/competencyDomains.test.ts` (additive tests only)

**Interfaces:**
- Consumes: nothing new (uses the file's own existing `officers`, `mulberry32`, `hashString`, `domains`, `getOfficerDomainScore`).
- Produces (new): `interface OfficerExpertise { domain: Domain; score: number }`; `getOfficerExpertise(officerId: string, cycleId: string): OfficerExpertise | null`. `getOfficerEngagement`'s existing signature and the featured officer's existing return values (`cycle-3`: `{learningHours:14, coursesCompleted:2}`, `cycle-4`: `{learningHours:22, coursesCompleted:4}`) are **unchanged** — this task only adds engagement data for the other 29 officers, who previously fell through to the `{learningHours:0, coursesCompleted:0}` default. Consumed by Task 5 (`OfficerDashboard`), Task 6 (`OfficerConnect`), Task 11 (`OfficerProfile`).

- [ ] **Step 1: Write the failing tests**

Append to `src/data/competencyDomains.test.ts` (add this new `describe` block; do not modify any existing test in the file):

```ts
describe('getOfficerEngagement (generated officers)', () => {
  it("does not change the featured officer's existing hand-authored values", () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-3')).toEqual({
      learningHours: 14,
      coursesCompleted: 2,
    })
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-4')).toEqual({
      learningHours: 22,
      coursesCompleted: 4,
    })
  })

  it('gives every other officer non-zero engagement at cycle-4, growing from cycle-3', () => {
    officers
      .filter((o) => o.id !== FEATURED_OFFICER_ID)
      .forEach((officer) => {
        const c3 = getOfficerEngagement(officer.id, 'cycle-3')
        const c4 = getOfficerEngagement(officer.id, 'cycle-4')
        expect(c4.learningHours).toBeGreaterThan(0)
        expect(c4.learningHours).toBeGreaterThanOrEqual(c3.learningHours)
        expect(c4.coursesCompleted).toBeGreaterThanOrEqual(c3.coursesCompleted)
      })
  })

  it('is deterministic across repeated calls', () => {
    const first = getOfficerEngagement('ananya-krishnan', 'cycle-4')
    const second = getOfficerEngagement('ananya-krishnan', 'cycle-4')
    expect(first).toEqual(second)
  })
})

describe('getOfficerExpertise', () => {
  it("returns the featured officer's strongest domain at cycle-4 (behavioural, from stakeholder_comm 79 / ethical_ai 64 averaging 72, the highest of the 4 domains)", () => {
    const result = getOfficerExpertise(FEATURED_OFFICER_ID, 'cycle-4')
    expect(result).not.toBeNull()
    expect(result?.domain.id).toBe('behavioural')
    expect(result?.score).toBe(72)
  })

  it('returns a non-null result for every officer at cycle-4', () => {
    officers.forEach((officer) => {
      expect(getOfficerExpertise(officer.id, 'cycle-4')).not.toBeNull()
    })
  })
})
```

`getOfficerEngagement`, `officers`, and `FEATURED_OFFICER_ID` are already imported in this test file (used by the pre-existing tests) — add only `getOfficerExpertise` to the existing `import { ... } from './competencyDomains'` line at the top of the file, rather than adding a second import statement.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/competencyDomains.test.ts`
Expected: FAIL — `getOfficerEngagement`/`getOfficerExpertise` not defined for the new assertions (or `getOfficerExpertise` not exported).

- [ ] **Step 3: Implement the extension**

In `src/data/competencyDomains.ts`, replace this block (currently lines 293-306):

```ts
const officerEngagement: Record<string, Record<string, { learningHours: number; coursesCompleted: number }>> = {
  [FEATURED_OFFICER_ID]: {
    'cycle-3': { learningHours: 14, coursesCompleted: 2 },
    'cycle-4': { learningHours: 22, coursesCompleted: 4 },
  },
}

export function getOfficerEngagement(
  officerId: string,
  cycleId: string,
): { learningHours: number; coursesCompleted: number } {
  return officerEngagement[officerId]?.[cycleId] ?? { learningHours: 0, coursesCompleted: 0 }
}
```

with:

```ts
function generateOfficerEngagement(
  officerId: string,
): Record<string, { learningHours: number; coursesCompleted: number }> {
  const rand = mulberry32(hashString(`${officerId}:engagement`))
  const cycle3Hours = Math.round(6 + rand() * 20)
  const cycle3Courses = Math.round(rand() * 4)
  const cycle4Hours = cycle3Hours + Math.round(4 + rand() * 14)
  const cycle4Courses = cycle3Courses + Math.round(rand() * 3)

  return {
    'cycle-3': { learningHours: cycle3Hours, coursesCompleted: cycle3Courses },
    'cycle-4': { learningHours: cycle4Hours, coursesCompleted: cycle4Courses },
  }
}

const officerEngagement: Record<string, Record<string, { learningHours: number; coursesCompleted: number }>> = {
  [FEATURED_OFFICER_ID]: {
    'cycle-3': { learningHours: 14, coursesCompleted: 2 },
    'cycle-4': { learningHours: 22, coursesCompleted: 4 },
  },
}

for (const officer of officers) {
  if (officer.id === FEATURED_OFFICER_ID) continue
  officerEngagement[officer.id] = generateOfficerEngagement(officer.id)
}

export function getOfficerEngagement(
  officerId: string,
  cycleId: string,
): { learningHours: number; coursesCompleted: number } {
  return officerEngagement[officerId]?.[cycleId] ?? { learningHours: 0, coursesCompleted: 0 }
}

export interface OfficerExpertise {
  domain: Domain
  score: number
}

export function getOfficerExpertise(officerId: string, cycleId: string): OfficerExpertise | null {
  const scored = domains
    .map((domain) => ({ domain, ...getOfficerDomainScore(officerId, domain.id, cycleId) }))
    .filter((entry): entry is { domain: Domain; score: number; confidence: 'scored' | 'partial' } => entry.score !== null)

  if (scored.length === 0) return null

  return scored.reduce((max, entry) => (entry.score > max.score ? entry : max), scored[0])
}
```

Note: `generateOfficerEngagement` must be defined (and the `officerEngagement` population loop must run) **after** `mulberry32`/`hashString` are defined earlier in the file and **after** `officers` is imported at the top — both are already true at this point in the file, so no import changes are needed.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/competencyDomains.test.ts`
Expected: PASS (all tests, including the pre-existing ones — this is an additive change, nothing else in the file should have changed behavior)

- [ ] **Step 5: Run the full suite to confirm no regression**

Run: `npx vitest run`
Expected: PASS (all files, including `departments.test.ts` which depends on `competencyDomains.ts`)

- [ ] **Step 6: Commit**

```bash
git add src/data/competencyDomains.ts src/data/competencyDomains.test.ts
git commit -m "feat: generate course engagement for every officer and add expertise lookup"
```

---

## Task 4: `OfficerCourses` redesign — card grid with banners

**Files:**
- Modify: `src/components/officer/OfficerCourses.tsx` (full rewrite)

**Interfaces:**
- Consumes: `FEATURED_OFFICER_ID`, `officers` from `../../data/officers` (existing); `getOfficerCourseAssignments`, `type CourseAssignmentDetail`, `type BannerVariant` from `../../data/courses` (Task 2).
- Produces: same no-prop `OfficerCourses()` signature — `OfficerApp.tsx` needs no changes for this task alone.

- [ ] **Step 1: Rewrite `OfficerCourses.tsx`**

Replace the full contents of `src/components/officer/OfficerCourses.tsx` with:

```tsx
import { CheckCircle, CircleDashed, Clock } from '@phosphor-icons/react'
import { type BannerVariant, type CourseAssignmentDetail, getOfficerCourseAssignments } from '../../data/courses'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'

// Decorative-only gradient variety for the course catalog's illustration-banner slot — a
// narrow, spec-sanctioned exception to the app's locked-token color rule (spec §5). Never
// reuse these for anything that carries meaning (status, score, category identity).
const bannerClass: Record<BannerVariant, string> = {
  teal: 'bg-gradient-to-br from-teal-400 to-teal-700',
  coral: 'bg-gradient-to-br from-orange-300 to-rose-600',
  violet: 'bg-gradient-to-br from-violet-400 to-indigo-700',
  amber: 'bg-gradient-to-br from-amber-300 to-orange-600',
  forest: 'bg-gradient-to-br from-emerald-400 to-teal-800',
  slate: 'bg-gradient-to-br from-slate-400 to-slate-700',
  rose: 'bg-gradient-to-br from-pink-300 to-rose-700',
  sky: 'bg-gradient-to-br from-sky-300 to-blue-700',
}

const statusMeta: Record<
  CourseAssignmentDetail['status'],
  { label: string; pillClass: string; icon: typeof CheckCircle }
> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient', icon: CircleDashed },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate', icon: Clock },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong', icon: CheckCircle },
}

function CourseCard({ assignment }: { assignment: CourseAssignmentDetail }) {
  const meta = statusMeta[assignment.status]
  const StatusIcon = meta.icon

  return (
    <div className="card-lift overflow-hidden rounded-sm border border-border bg-surface">
      <div className={`h-20 ${bannerClass[assignment.course.bannerVariant]}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-caption font-medium text-text-muted">{assignment.course.code}</span>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}
          >
            <StatusIcon size={12} weight="fill" />
            {meta.label}
          </span>
        </div>

        <h2 className="mt-1.5 text-h2 font-semibold text-text-primary">{assignment.course.title}</h2>
        <p className="mt-1 text-caption text-text-muted">
          {assignment.course.provider} · {assignment.course.format}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-caption">
            <span className="text-text-secondary">Progress</span>
            <span className="font-medium tabular-nums text-text-primary">{assignment.percentComplete}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
            <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-caption text-text-muted">
          <span>
            {assignment.modulesCompleted}/{assignment.course.modulesTotal} modules
          </span>
          <span>
            Due{' '}
            {new Date(assignment.dueDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function OfficerCourses() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const assignments = getOfficerCourseAssignments(officer.id)

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">My Courses</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        {assignments.length} course{assignments.length === 1 ? '' : 's'} assigned to{' '}
        {officer.name.split(' ')[0]} this cycle.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <CourseCard key={assignment.courseId} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/officer/OfficerCourses.tsx
git commit -m "refactor: redesign OfficerCourses as a banner card grid with real progress"
```

---

## Task 5: `OfficerDashboard` enrichment — 3 new cards + badge-shape fix

**Files:**
- Modify: `src/components/officer/OfficerDashboard.tsx` (full rewrite)

**Interfaces:**
- Consumes (new, beyond what the file already imports): `getOfficerCourseAssignments`, `type CourseAssignmentDetail` from `../../data/courses` (Task 2); `getOfficerExpertise`, `type OfficerExpertise` from `../../data/competencyDomains` (Task 3, already in this file's import list — add these two names to the existing import); `departments`, `getDepartmentAvgScore`, `getDepartmentAssessedFraction` from `../../data/departments` (existing); `type Officer` from `../../data/officers` (add to the existing import).
- Produces: `OfficerDashboard(props: { onNavigate?: (section: 'courses' | 'connect') => void })` — the prop is **optional** and new (previously no-prop). `onNavigate` is a locally-defined union type in this file, not imported from `OfficerTopBar`, so this task type-checks on its own before Task 7 wires the callback through. Consumed by Task 7 (`OfficerApp`).

- [ ] **Step 1: Rewrite `OfficerDashboard.tsx`**

Replace the full contents of `src/components/officer/OfficerDashboard.tsx` with:

```tsx
import { Books, ChartLineUp, CheckCircle, ClockCountdown } from '@phosphor-icons/react'
import {
  assessmentCycles,
  CURRENT_CYCLE_ID,
  type DomainId,
  domains,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerExpertise,
  getOfficerOverallScore,
  getPreviousCycleId,
  type OfficerExpertise,
  taxonomyCompetencies,
} from '../../data/competencyDomains'
import { getOfficerCourseAssignments, type CourseAssignmentDetail } from '../../data/courses'
import { getDepartmentAssessedFraction, getDepartmentAvgScore, departments } from '../../data/departments'
import { FEATURED_OFFICER_ID, officers, type Officer } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

const courseSummaryPriority: Record<CourseAssignmentDetail['status'], number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

interface OfficerDashboardProps {
  onNavigate?: (section: 'courses' | 'connect') => void
}

export function OfficerDashboard({ onNavigate }: OfficerDashboardProps) {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const previousCycleId = getPreviousCycleId(CURRENT_CYCLE_ID)!

  const currentOverall = getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID)
  const previousOverall = getOfficerOverallScore(officer.id, previousCycleId)
  const currentAssessed = getOfficerAssessedCount(officer.id, CURRENT_CYCLE_ID)
  const previousAssessed = getOfficerAssessedCount(officer.id, previousCycleId)
  const currentEngagement = getOfficerEngagement(officer.id, CURRENT_CYCLE_ID)
  const previousEngagement = getOfficerEngagement(officer.id, previousCycleId)

  const domainScores = domains.map((domain) => ({
    domain,
    ...getOfficerDomainScore(officer.id, domain.id, CURRENT_CYCLE_ID),
  }))

  const scoredDomains = domainScores.filter((entry) => entry.score !== null)
  const weakestDomain = scoredDomains.reduce(
    (min, entry) => (entry.score! < min.score! ? entry : min),
    scoredDomains[0] ?? domainScores[0],
  )

  const gapCount = taxonomyCompetencies.length - currentAssessed
  const totalAvgScore =
    scoredDomains.length > 0
      ? Math.round(scoredDomains.reduce((sum, entry) => sum + entry.score!, 0) / scoredDomains.length)
      : 0

  const overallTrend = trendMeta(currentOverall, previousOverall)
  const assessedTrend = trendMeta(currentAssessed, previousAssessed)
  const hoursTrend = trendMeta(currentEngagement.learningHours, previousEngagement.learningHours)
  const coursesTrend = trendMeta(currentEngagement.coursesCompleted, previousEngagement.coursesCompleted)

  const chartPoints = assessmentCycles.map((cycle) => ({
    label: cycle.label.replace(' (Current)', ''),
    value: getOfficerOverallScore(officer.id, cycle.id),
  }))

  const courseAssignments = getOfficerCourseAssignments(officer.id)
  const courseSummary = [...courseAssignments]
    .sort((a, b) => courseSummaryPriority[a.status] - courseSummaryPriority[b.status])
    .slice(0, 3)

  const department = departments.find((d) => d.id === officer.departmentId)!
  const departmentAvg = getDepartmentAvgScore(department.id)
  const departmentAssessed = getDepartmentAssessedFraction(department.id)

  const connectSuggestions = officers
    .filter((o) => o.id !== officer.id)
    .map((o) => ({ officer: o, expertise: getOfficerExpertise(o.id, CURRENT_CYCLE_ID) }))
    .filter(
      (entry): entry is { officer: Officer; expertise: OfficerExpertise } =>
        entry.expertise !== null && entry.expertise.domain.id === weakestDomain.domain.id,
    )
    .sort((a, b) => b.expertise.score - a.expertise.score)
    .slice(0, 3)

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">Welcome back, {officer.name.split(' ')[0]}</h1>
      <p className="mt-2 max-w-[68ch] text-body text-text-secondary">
        You have {gapCount} competenc{gapCount === 1 ? 'y' : 'ies'} without a current-cycle score, and{' '}
        {weakestDomain.domain.name.toLowerCase()} is your area with the most room to grow.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${currentOverall}%`}
          previousLabel={`${previousOverall}% previous cycle`}
          deltaLabel={overallTrend.deltaLabel}
          trend={overallTrend.trend}
          icon={ChartLineUp}
        />
        <StatCard
          label="Competencies Assessed"
          value={`${currentAssessed} of ${taxonomyCompetencies.length}`}
          previousLabel={`${previousAssessed} of ${taxonomyCompetencies.length} previous cycle`}
          deltaLabel={assessedTrend.deltaLabel}
          trend={assessedTrend.trend}
          icon={CheckCircle}
        />
        <StatCard
          label="Learning Hours"
          value={`${currentEngagement.learningHours}h`}
          previousLabel={`${previousEngagement.learningHours}h previous cycle`}
          deltaLabel={hoursTrend.deltaLabel}
          trend={hoursTrend.trend}
          icon={ClockCountdown}
        />
        <StatCard
          label="Courses Completed"
          value={`${currentEngagement.coursesCompleted}`}
          previousLabel={`${previousEngagement.coursesCompleted} previous cycle`}
          deltaLabel={coursesTrend.deltaLabel}
          trend={coursesTrend.trend}
          icon={Books}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency score across cycles</p>
          <div className="mt-4">
            <TrendBarChart points={chartPoints} />
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency Domains</p>
          <p className="mt-1 text-metric font-semibold tabular-nums text-text-primary">{totalAvgScore}%</p>
          <p className="text-caption text-text-muted">Average across {domains.length} domains</p>

          <div className="mt-4">
            <SegmentedBar
              segments={domainScores.map((entry) => ({
                id: entry.domain.id,
                label: entry.domain.name,
                value: taxonomyCompetencies.filter((c) => c.domainId === entry.domain.id).length,
                colorClass: domainColorClass[entry.domain.id],
              }))}
            />
          </div>

          <div className="mt-4 divide-y divide-border">
            {domainScores.map((entry) => (
              <div key={entry.domain.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-body text-text-primary">{entry.domain.name}</span>
                {entry.confidence === 'insufficient' ? (
                  <span className="rounded-full border border-dashed border-insufficient bg-surface px-2 py-0.5 text-micro font-medium text-insufficient">
                    Insufficient data
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="text-cell font-medium tabular-nums text-text-primary">{entry.score}%</span>
                    {entry.confidence === 'partial' && (
                      <span className="text-micro text-text-muted">(partial)</span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-h2 font-semibold text-text-primary">My Courses</p>
            <button
              type="button"
              onClick={() => onNavigate?.('courses')}
              className="text-caption font-medium text-primary hover:text-primary-hover"
            >
              View all
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {courseSummary.map((assignment) => (
              <div key={assignment.courseId}>
                <div className="flex items-center justify-between gap-2 text-caption">
                  <span className="truncate text-text-primary">{assignment.course.title}</span>
                  <span className="shrink-0 tabular-nums text-text-muted">{assignment.percentComplete}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
                  <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">My Department</p>
          <p className="mt-1 text-caption text-text-muted">
            {department.code} · {department.name}
          </p>
          <div className="mt-3 flex items-center justify-between text-caption">
            <span className="text-text-secondary">Avg competency</span>
            <span className="font-medium tabular-nums text-text-primary">{departmentAvg}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
            <div className="h-full bg-primary" style={{ width: `${departmentAvg}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-caption">
            <span className="text-text-secondary">Officers assessed</span>
            <span className="font-medium tabular-nums text-text-primary">
              {departmentAssessed.assessed}/{departmentAssessed.total}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-h2 font-semibold text-text-primary">Connect Suggestions</p>
            <button
              type="button"
              onClick={() => onNavigate?.('connect')}
              className="text-caption font-medium text-primary hover:text-primary-hover"
            >
              View all
            </button>
          </div>
          <p className="mt-1 text-caption text-text-muted">
            Officers strong in {weakestDomain.domain.name.toLowerCase()}, your area with the most room to grow.
          </p>
          <div className="mt-3 space-y-2">
            {connectSuggestions.map(({ officer: suggested, expertise }) => (
              <div key={suggested.id} className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                  {initials(suggested.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-caption font-medium text-text-primary">{suggested.name}</p>
                  <p className="truncate text-micro text-text-muted">
                    {expertise.domain.name} · {expertise.score}%
                  </p>
                </div>
              </div>
            ))}
            {connectSuggestions.length === 0 && (
              <p className="text-caption text-text-muted">No matching officers this cycle.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/officer/OfficerDashboard.tsx
git commit -m "feat: populate OfficerDashboard with courses, department, and connect cards"
```

---

## Task 6: `OfficerConnect` — directory with mock messaging

**Files:**
- Create: `src/components/officer/OfficerConnect.tsx`

**Interfaces:**
- Consumes: `FEATURED_OFFICER_ID`, `officers` from `../../data/officers` (existing); `getOfficerExpertise`, `CURRENT_CYCLE_ID` from `../../data/competencyDomains` (Task 3).
- Produces: `OfficerConnect()` — no props. Consumed by Task 7 (`OfficerApp`).

Message state (a `Record<officerId, Message[]>`) lives entirely in this component via `useState` — no persistence, no backend. New messages the officer sends use `Date.now()`/`new Date().toISOString()` for their id/timestamp, which is fine here: that constraint on determinism applies to the mock *data layer* (`courses.ts`, `competencyDomains.ts`, baked into the bundle), not to live runtime UI interaction state generated while a user is actually using the page.

- [ ] **Step 1: Implement `OfficerConnect.tsx`**

Create `src/components/officer/OfficerConnect.tsx`:

```tsx
import { useState } from 'react'
import { MagnifyingGlass, PaperPlaneTilt, X } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, getOfficerExpertise } from '../../data/competencyDomains'
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
                    <p className="text-caption text-text-muted">{entryOfficer.departmentId.toUpperCase()}</p>
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/officer/OfficerConnect.tsx
git commit -m "feat: add OfficerConnect directory with mock messaging"
```

---

## Task 7: Wire the Connect tab into the officer shell (live-browser checkpoint)

**Files:**
- Modify: `src/components/officer/OfficerTopBar.tsx` (full rewrite)
- Modify: `src/pages/OfficerApp.tsx` (full rewrite)

**Interfaces:**
- Consumes: `OfficerDashboard` (Task 5, now takes optional `onNavigate`), `OfficerCourses` (Task 4), `OfficerConnect` (Task 6).
- Produces: `type OfficerSection = 'dashboard' | 'courses' | 'connect'` (extends the existing 2-value union with `'connect'`).

- [ ] **Step 1: Rewrite `OfficerTopBar.tsx`**

Replace the full contents of `src/components/officer/OfficerTopBar.tsx` with:

```tsx
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
```

- [ ] **Step 2: Rewrite `OfficerApp.tsx`**

Replace the full contents of `src/pages/OfficerApp.tsx` with:

```tsx
import { useState } from 'react'
import { OfficerConnect } from '../components/officer/OfficerConnect'
import { OfficerCourses } from '../components/officer/OfficerCourses'
import { OfficerDashboard } from '../components/officer/OfficerDashboard'
import { OfficerTopBar, type OfficerSection } from '../components/officer/OfficerTopBar'

export function OfficerApp() {
  const [section, setSection] = useState<OfficerSection>('dashboard')

  return (
    <div className="min-h-screen bg-bg">
      <OfficerTopBar activeSection={section} onSelectSection={setSection} />
      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {section === 'dashboard' && <OfficerDashboard onNavigate={setSection} />}
        {section === 'courses' && <OfficerCourses />}
        {section === 'connect' && <OfficerConnect />}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 4: Manual verification (live browser checkpoint)**

Run `npm run dev`. Log in as Officer.

1. Confirm 3 tabs render: My Dashboard, My Courses, Connect.
2. On My Dashboard, confirm the 3 new cards render with real content (My Courses shows 3 rows with progress bars, My Department shows Field Operations Division's real avg score, Connect Suggestions shows officers whose expertise matches Rohit's weakest domain).
3. Click "View all" on the My Courses card — confirm it switches to the My Courses tab.
4. Go back to My Dashboard, click "View all" on Connect Suggestions — confirm it switches to the Connect tab.
5. On Connect, search for a name and confirm the grid filters; search for a domain name (e.g. "Statistical") and confirm it also filters by expertise.
6. Click "Message" on Ananya Krishnan specifically — confirm the seeded 2-message thread renders (one bubble each side). Type a message and send it (button or Enter key) — confirm it appends as your own bubble and the input clears.
7. Click "Message" on a different officer with no seeded thread — confirm the "Start a conversation" empty state renders instead.
8. Confirm My Courses (the redesigned page) shows 5 banner cards with distinct status pills (3 Completed, 1 In Progress, 1 Not Started) and progress bars/module fractions matching the hand-authored data.

- [ ] **Step 5: Commit**

```bash
git add src/components/officer/OfficerTopBar.tsx src/pages/OfficerApp.tsx
git commit -m "feat: wire the Connect tab and dashboard cross-navigation into the officer shell"
```

---

## Task 8: `CourseProgressBoard` — admin course-progress table

**Files:**
- Create: `src/components/admin/CourseProgressBoard.tsx`

**Interfaces:**
- Consumes: `courses`, `getAllAssignmentsWithDetails`, `filterCourseAssignments`, `type AssignmentStatus` from `../../data/courses` (Task 2); `departments` from `../../data/departments` (existing).
- Produces: `CourseProgressBoard()` — no props. Consumed by Task 12 (`DiagnosticsApp` wiring).

- [ ] **Step 1: Implement `CourseProgressBoard.tsx`**

Create `src/components/admin/CourseProgressBoard.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { type AssignmentStatus, courses, filterCourseAssignments, getAllAssignmentsWithDetails } from '../../data/courses'
import { departments } from '../../data/departments'

const statusMeta: Record<AssignmentStatus, { label: string; pillClass: string }> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient' },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate' },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong' },
}

export function CourseProgressBoard() {
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const allAssignments = useMemo(() => getAllAssignmentsWithDetails(), [])

  const filtered = useMemo(() => {
    return filterCourseAssignments(allAssignments, {
      departmentId: departmentFilter === 'all' ? undefined : departmentFilter,
      courseId: courseFilter === 'all' ? undefined : courseFilter,
      status: statusFilter === 'all' ? undefined : (statusFilter as AssignmentStatus),
    })
  }, [allAssignments, departmentFilter, courseFilter, statusFilter])

  const hasActiveFilters = departmentFilter !== 'all' || courseFilter !== 'all' || statusFilter !== 'all'

  return (
    <div>
      <p className="text-caption text-text-muted">
        {filtered.length} of {allAssignments.length} assignments
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setDepartmentFilter('all')
              setCourseFilter('all')
              setStatusFilter('all')
            }}
            className="text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.2fr_1fr] border-b border-border bg-surface-alt">
          {['Officer', 'Course', 'Department', 'Status', 'Progress', 'Due date'].map((heading) => (
            <span key={heading} className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">
              {heading}
            </span>
          ))}
        </div>
        {filtered.map((entry) => {
          const department = departments.find((d) => d.id === entry.officer.departmentId)!
          const meta = statusMeta[entry.status]
          return (
            <div
              key={`${entry.officerId}-${entry.courseId}`}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.2fr_1fr] items-center border-b border-border bg-surface px-0 py-2.5 last:border-b-0 hover:bg-surface-alt"
            >
              <span className="truncate px-3 text-body text-text-primary">{entry.officer.name}</span>
              <span className="truncate px-3 text-caption text-text-secondary">{entry.course.title}</span>
              <span className="truncate px-3 text-caption text-text-secondary">{department.code}</span>
              <span className="px-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}>
                  {meta.label}
                </span>
              </span>
              <span className="px-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-surface-alt">
                    <div className="h-full bg-primary" style={{ width: `${entry.percentComplete}%` }} />
                  </div>
                  <span className="text-micro tabular-nums text-text-muted">{entry.percentComplete}%</span>
                </div>
              </span>
              <span className="px-3 text-caption text-text-secondary">
                {new Date(entry.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-caption text-text-muted">No assignments match the current filters.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CourseProgressBoard.tsx
git commit -m "feat: add CourseProgressBoard admin table"
```

---

## Task 9: Add "Course Progress" nav item

**Files:**
- Modify: `src/mockData.ts`
- Modify: `src/components/layout/LeftNav.tsx`

**Interfaces:** No new exports — `navGroups` gains one more `NavItem` entry (existing shape, `{ id: string; label: string }`); `iconByItemId` gains one more key. No other file needs to change for this task alone (`DiagnosticsApp.tsx`'s render wiring for the new section is Task 12).

- [ ] **Step 1: Add the nav entry, section copy, and breadcrumb to `mockData.ts`**

In `src/mockData.ts`, inside the `navGroups` array's `'diagnostics-group'` entry, change:

```ts
      { id: 'officers', label: 'Officers' },
      { id: 'reports', label: 'Reports' },
    ],
  },
```

to:

```ts
      { id: 'officers', label: 'Officers' },
      { id: 'reports', label: 'Reports' },
      { id: 'courseProgress', label: 'Course Progress' },
    ],
  },
```

Then, in the `sectionCopy` object, add a new entry (place it alongside the other section entries, e.g. after `reports`):

```ts
  courseProgress: {
    title: 'Course Progress',
    subtitle: 'Every officer\'s assigned iGOT Karmayogi courses and completion status this cycle.',
  },
```

And in `breadcrumbBySection`, add:

```ts
  courseProgress: ['Course Progress'],
```

- [ ] **Step 2: Add the icon mapping in `LeftNav.tsx`**

In `src/components/layout/LeftNav.tsx`, add `ChartLineUp` to the icon import from `@phosphor-icons/react` (alongside the existing `ChartBar`, `ClipboardText`, etc.), and add one entry to `iconByItemId`:

```ts
  courseProgress: ChartLineUp,
```

(placed anywhere in that `Record<string, Icon>` object — order doesn't matter.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors. (`DiagnosticsApp.tsx` doesn't yet handle a `'courseProgress'` section, so clicking the new nav item will currently render nothing extra in the content area below the title/subtitle — that's expected until Task 12 wires it up. The title/subtitle will already work correctly since `sectionCopy`/`breadcrumbBySection` are keyed generically by section id string.)

- [ ] **Step 4: Commit**

```bash
git add src/mockData.ts src/components/layout/LeftNav.tsx
git commit -m "feat: add the Course Progress nav item"
```

---

## Task 10: `DepartmentOfficerList` — department drill-down officer list

**Files:**
- Create: `src/components/admin/DepartmentOfficerList.tsx`

**Interfaces:**
- Consumes: `departments`, `getDepartmentOfficers`, `getDepartmentAvgScore`, `getDepartmentStatus`, `type DepartmentStatus` from `../../data/departments` (existing); `getOfficerOverallScore`, `CURRENT_CYCLE_ID` from `../../data/competencyDomains` (existing); `levelFromScore` from `../../data/thresholds` (existing).
- Produces: `DepartmentOfficerList(props: { departmentId: string; onBack: () => void; onSelectOfficer: (officerId: string) => void })`. Consumed by Task 12 (`DiagnosticsApp` wiring).

- [ ] **Step 1: Implement `DepartmentOfficerList.tsx`**

Create `src/components/admin/DepartmentOfficerList.tsx`:

```tsx
import { CaretLeft } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, getOfficerOverallScore } from '../../data/competencyDomains'
import {
  type DepartmentStatus,
  departments,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from '../../data/departments'
import { levelFromScore } from '../../data/thresholds'

interface DepartmentOfficerListProps {
  departmentId: string
  onBack: () => void
  onSelectOfficer: (officerId: string) => void
}

const statusLabel: Record<DepartmentStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  critical: 'Critical',
}

const statusClass: Record<DepartmentStatus, string> = {
  on_track: 'bg-strong-tint text-strong',
  at_risk: 'bg-moderate-tint text-moderate',
  critical: 'bg-weak-tint text-weak',
}

const levelClass: Record<'strong' | 'moderate' | 'weak', string> = {
  strong: 'bg-strong-tint text-strong',
  moderate: 'bg-moderate-tint text-moderate',
  weak: 'bg-weak-tint text-weak',
}

const levelLabel: Record<'strong' | 'moderate' | 'weak', string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
}

export function DepartmentOfficerList({ departmentId, onBack, onSelectOfficer }: DepartmentOfficerListProps) {
  const department = departments.find((d) => d.id === departmentId)!
  const officersInDept = getDepartmentOfficers(departmentId)
  const avgScore = getDepartmentAvgScore(departmentId)
  const status = getDepartmentStatus(departmentId)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
      >
        <CaretLeft size={14} />
        Back to departments
      </button>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-caption text-text-muted">{department.code}</p>
          <h2 className="mt-0.5 text-h1 font-semibold text-text-primary">{department.name}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${statusClass[status]}`}>
          {statusLabel[status]}
        </span>
      </div>
      <p className="mt-1 text-caption text-text-secondary">
        {avgScore}% average competency across {officersInDept.length} officers.
      </p>

      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border bg-surface-alt">
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Officer</span>
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Score</span>
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Level</span>
        </div>
        {officersInDept.map((officer) => {
          const score = getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID)
          const level = levelFromScore(score)
          return (
            <button
              key={officer.id}
              type="button"
              onClick={() => onSelectOfficer(officer.id)}
              className="grid w-full grid-cols-[2fr_1fr_1fr] items-center border-b border-border bg-surface text-left transition-colors last:border-b-0 hover:bg-surface-alt"
            >
              <span className="truncate px-3 py-2.5 text-body text-text-primary">{officer.name}</span>
              <span className="px-3 py-2.5 text-cell font-medium tabular-nums text-text-primary">{score}%</span>
              <span className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${levelClass[level]}`}>
                  {levelLabel[level]}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/DepartmentOfficerList.tsx
git commit -m "feat: add DepartmentOfficerList drill-down"
```

---

## Task 11: `OfficerProfile` — admin-facing generalized officer profile

**Files:**
- Create: `src/components/admin/OfficerProfile.tsx`

**Interfaces:**
- Consumes: `assessmentCycles`, `CURRENT_CYCLE_ID`, `type DomainId`, `domains`, `getOfficerAssessedCount`, `getOfficerDomainScore`, `getOfficerEngagement`, `getOfficerOverallScore`, `getPreviousCycleId`, `taxonomyCompetencies` from `../../data/competencyDomains` (existing/Task 3); `getOfficerCourseAssignments` from `../../data/courses` (Task 2); `officers`, `departments` (via `../../data/departments`), `getDepartmentAvgScore` — same functions `OfficerDashboard`/`DepartmentOfficerList` already use; `StatCard`, `SegmentedBar`, `TrendBarChart` from `../shared/*` (existing).
- Produces: `OfficerProfile(props: { officerId: string; onBack: () => void })`. Consumed by Task 12 (`DiagnosticsApp` wiring).

This is a generalized, admin-framed version of `OfficerDashboard`'s presentation (same stat cards, trend chart, domain breakdown shape) parameterized by an arbitrary officer id instead of hardcoded to `FEATURED_OFFICER_ID`, plus a course-progress section. Copy is admin-framed ("{Name}'s Profile", not "Welcome back"/"My").

- [ ] **Step 1: Implement `OfficerProfile.tsx`**

Create `src/components/admin/OfficerProfile.tsx`:

```tsx
import { Books, CaretLeft, ChartLineUp, CheckCircle, ClockCountdown } from '@phosphor-icons/react'
import {
  assessmentCycles,
  CURRENT_CYCLE_ID,
  type DomainId,
  domains,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerOverallScore,
  getPreviousCycleId,
  taxonomyCompetencies,
} from '../../data/competencyDomains'
import { type AssignmentStatus, getOfficerCourseAssignments } from '../../data/courses'
import { departments, getDepartmentAvgScore } from '../../data/departments'
import { officers } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

const courseStatusMeta: Record<AssignmentStatus, { label: string; pillClass: string }> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient' },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate' },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong' },
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

interface OfficerProfileProps {
  officerId: string
  onBack: () => void
}

export function OfficerProfile({ officerId, onBack }: OfficerProfileProps) {
  const officer = officers.find((o) => o.id === officerId)!
  const department = departments.find((d) => d.id === officer.departmentId)!
  const previousCycleId = getPreviousCycleId(CURRENT_CYCLE_ID)!

  const currentOverall = getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID)
  const previousOverall = getOfficerOverallScore(officer.id, previousCycleId)
  const currentAssessed = getOfficerAssessedCount(officer.id, CURRENT_CYCLE_ID)
  const previousAssessed = getOfficerAssessedCount(officer.id, previousCycleId)
  const currentEngagement = getOfficerEngagement(officer.id, CURRENT_CYCLE_ID)
  const previousEngagement = getOfficerEngagement(officer.id, previousCycleId)

  const domainScores = domains.map((domain) => ({
    domain,
    ...getOfficerDomainScore(officer.id, domain.id, CURRENT_CYCLE_ID),
  }))

  const overallTrend = trendMeta(currentOverall, previousOverall)
  const assessedTrend = trendMeta(currentAssessed, previousAssessed)
  const hoursTrend = trendMeta(currentEngagement.learningHours, previousEngagement.learningHours)
  const coursesTrend = trendMeta(currentEngagement.coursesCompleted, previousEngagement.coursesCompleted)

  const chartPoints = assessmentCycles.map((cycle) => ({
    label: cycle.label.replace(' (Current)', ''),
    value: getOfficerOverallScore(officer.id, cycle.id),
  }))

  const courseAssignments = getOfficerCourseAssignments(officer.id)
  const departmentAvg = getDepartmentAvgScore(department.id)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
      >
        <CaretLeft size={14} />
        Back to {department.name}
      </button>

      <h1 className="mt-3 text-title font-semibold text-text-primary">{officer.name}'s Profile</h1>
      <p className="mt-2 text-body text-text-secondary">
        {department.code} · {department.name} · Department average {departmentAvg}%
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${currentOverall}%`}
          previousLabel={`${previousOverall}% previous cycle`}
          deltaLabel={overallTrend.deltaLabel}
          trend={overallTrend.trend}
          icon={ChartLineUp}
        />
        <StatCard
          label="Competencies Assessed"
          value={`${currentAssessed} of ${taxonomyCompetencies.length}`}
          previousLabel={`${previousAssessed} of ${taxonomyCompetencies.length} previous cycle`}
          deltaLabel={assessedTrend.deltaLabel}
          trend={assessedTrend.trend}
          icon={CheckCircle}
        />
        <StatCard
          label="Learning Hours"
          value={`${currentEngagement.learningHours}h`}
          previousLabel={`${previousEngagement.learningHours}h previous cycle`}
          deltaLabel={hoursTrend.deltaLabel}
          trend={hoursTrend.trend}
          icon={ClockCountdown}
        />
        <StatCard
          label="Courses Completed"
          value={`${currentEngagement.coursesCompleted}`}
          previousLabel={`${previousEngagement.coursesCompleted} previous cycle`}
          deltaLabel={coursesTrend.deltaLabel}
          trend={coursesTrend.trend}
          icon={Books}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency score across cycles</p>
          <div className="mt-4">
            <TrendBarChart points={chartPoints} />
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency Domains</p>
          <div className="mt-4">
            <SegmentedBar
              segments={domainScores.map((entry) => ({
                id: entry.domain.id,
                label: entry.domain.name,
                value: taxonomyCompetencies.filter((c) => c.domainId === entry.domain.id).length,
                colorClass: domainColorClass[entry.domain.id],
              }))}
            />
          </div>
          <div className="mt-4 divide-y divide-border">
            {domainScores.map((entry) => (
              <div key={entry.domain.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-body text-text-primary">{entry.domain.name}</span>
                {entry.confidence === 'insufficient' ? (
                  <span className="rounded-full border border-dashed border-insufficient bg-surface px-2 py-0.5 text-micro font-medium text-insufficient">
                    Insufficient data
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="text-cell font-medium tabular-nums text-text-primary">{entry.score}%</span>
                    {entry.confidence === 'partial' && (
                      <span className="text-micro text-text-muted">(partial)</span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-sm border border-border bg-surface p-4">
        <p className="text-h2 font-semibold text-text-primary">Course Progress</p>
        <div className="mt-3 divide-y divide-border">
          {courseAssignments.map((assignment) => {
            const meta = courseStatusMeta[assignment.status]
            return (
              <div key={assignment.courseId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-text-primary">{assignment.course.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-sm bg-surface-alt">
                      <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
                    </div>
                    <span className="text-micro tabular-nums text-text-muted">{assignment.percentComplete}%</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}>
                  {meta.label}
                </span>
              </div>
            )
          })}
          {courseAssignments.length === 0 && (
            <p className="py-2.5 text-caption text-text-muted">No courses assigned.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/OfficerProfile.tsx
git commit -m "feat: add admin-facing OfficerProfile"
```

---

## Task 12: Wire drill-down and Course Progress into the admin app (live-browser checkpoint)

**Files:**
- Modify: `src/components/admin/AdminCohortOverview.tsx` (add a "View officers" link per card)
- Modify: `src/pages/DiagnosticsApp.tsx` (full rewrite — drill-down state + Course Progress section)

**Interfaces:**
- Consumes: `DepartmentOfficerList` (Task 10), `OfficerProfile` (Task 11), `CourseProgressBoard` (Task 8), `officers` from `../data/officers` (existing, needed to resolve an officer's department for the profile's "back" target).
- Produces: `AdminCohortOverview(props: { onSelectDepartment: (departmentId: string) => void })` — previously no-prop, now requires this callback.

- [ ] **Step 1: Add a "View officers" link to each department card**

In `src/components/admin/AdminCohortOverview.tsx`, add `CaretRight` to the `@phosphor-icons/react` import (alongside `CalendarBlank`, `UsersThree`), change the component signature from:

```tsx
export function AdminCohortOverview() {
```

to:

```tsx
interface AdminCohortOverviewProps {
  onSelectDepartment: (departmentId: string) => void
}

export function AdminCohortOverview({ onSelectDepartment }: AdminCohortOverviewProps) {
```

and inside the department card, immediately before the closing `</div>` of the card (after the "Next review" row), add:

```tsx
              <button
                type="button"
                onClick={() => onSelectDepartment(department.id)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-alt"
              >
                View officers
                <CaretRight size={12} />
              </button>
```

Nothing else in this file changes — `departmentDomainCells`, the status/heat-sparkline/progress-bar rendering all stay exactly as they are.

- [ ] **Step 2: Rewrite `DiagnosticsApp.tsx`**

Replace the full contents of `src/pages/DiagnosticsApp.tsx` with:

```tsx
import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { AdminCohortOverview } from '../components/admin/AdminCohortOverview'
import { CourseProgressBoard } from '../components/admin/CourseProgressBoard'
import { DepartmentOfficerList } from '../components/admin/DepartmentOfficerList'
import { OfficerProfile } from '../components/admin/OfficerProfile'
import { RejectionAuditBoard } from '../components/admin/RejectionAuditBoard'
import { DashboardScreen } from '../components/screens/DashboardScreen'
import { GenerateScreen } from '../components/screens/GenerateScreen'
import { OfficersScreen } from '../components/screens/OfficersScreen'
import { QuizScreen } from '../components/screens/QuizScreen'
import { RecommendationsScreen } from '../components/screens/RecommendationsScreen'
import { ReportsScreen } from '../components/screens/ReportsScreen'
import { SettingsScreen } from '../components/screens/SettingsScreen'
import { UploadScreen } from '../components/screens/UploadScreen'
import { officers } from '../data/officers'
import {
  breadcrumbByStep,
  breadcrumbBySection,
  sectionCopy,
  stepCopy,
  type Step,
} from '../mockData'

type Section = 'overview' | 'diagnostics' | 'officers' | 'reports' | 'settings' | 'audit' | 'courseProgress'

type OverviewView =
  | { kind: 'departments' }
  | { kind: 'department'; departmentId: string }
  | { kind: 'officer'; officerId: string }

export function DiagnosticsApp() {
  const [section, setSection] = useState<Section>('overview')
  const [step, setStep] = useState<Step>('upload')
  const [overviewView, setOverviewView] = useState<OverviewView>({ kind: 'departments' })

  const goToDiagnostics = (targetStep: Step) => {
    setSection('diagnostics')
    setStep(targetStep)
  }

  function handleNavSelect(id: string, childId?: string) {
    if (id === 'diagnostics' && childId) {
      goToDiagnostics(childId as Step)
    } else {
      setSection(id as Section)
    }
  }

  const breadcrumb = section === 'diagnostics' ? breadcrumbByStep[step] : breadcrumbBySection[section]
  const title = section === 'diagnostics' ? stepCopy[step].title : sectionCopy[section].title
  const subtitle =
    section === 'diagnostics' ? stepCopy[step].subtitle : sectionCopy[section].subtitle

  return (
    <AppShell
      breadcrumb={breadcrumb}
      activeNavId={section}
      activeChildId={section === 'diagnostics' ? step : undefined}
      onNavSelect={handleNavSelect}
    >
      <h1 className="text-title font-semibold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">{subtitle}</p>

      <div className="mt-8">
        {section === 'overview' && overviewView.kind === 'departments' && (
          <AdminCohortOverview
            onSelectDepartment={(departmentId) => setOverviewView({ kind: 'department', departmentId })}
          />
        )}
        {section === 'overview' && overviewView.kind === 'department' && (
          <DepartmentOfficerList
            departmentId={overviewView.departmentId}
            onBack={() => setOverviewView({ kind: 'departments' })}
            onSelectOfficer={(officerId) => setOverviewView({ kind: 'officer', officerId })}
          />
        )}
        {section === 'overview' && overviewView.kind === 'officer' && (
          <OfficerProfile
            officerId={overviewView.officerId}
            onBack={() => {
              const officer = officers.find((o) => o.id === overviewView.officerId)!
              setOverviewView({ kind: 'department', departmentId: officer.departmentId })
            }}
          />
        )}
        {section === 'officers' && <OfficersScreen />}
        {section === 'reports' && (
          <ReportsScreen onViewReport={() => goToDiagnostics('dashboard')} />
        )}
        {section === 'settings' && <SettingsScreen />}
        {section === 'audit' && <RejectionAuditBoard />}
        {section === 'courseProgress' && <CourseProgressBoard />}

        {section === 'diagnostics' && (
          <>
            {step === 'upload' && <UploadScreen onComplete={() => setStep('generate')} />}
            {step === 'generate' && <GenerateScreen onComplete={() => setStep('quiz')} />}
            {step === 'quiz' && <QuizScreen onComplete={() => setStep('dashboard')} />}
            {step === 'dashboard' && (
              <DashboardScreen onComplete={() => setStep('recommendations')} />
            )}
            {step === 'recommendations' && (
              <RecommendationsScreen onRestart={() => setStep('upload')} />
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors.

- [ ] **Step 4: Manual verification (live browser checkpoint)**

Run `npm run dev`. Log in as Coordinator (Admin).

1. Dashboard shows the 6 department cards, each now with a "View officers" button.
2. Click "View officers" on Field Operations Division — confirm it shows a 5-officer list (Rohit Malhotra + 4 others) with real scores and level pills, and a "Back to departments" link.
3. Click Rohit Malhotra — confirm his profile page renders: "Rohit Malhotra's Profile", 4 stat cards matching his known numbers (67% overall, 9 of 10 assessed, 22h, 4 courses — vs 60%/10/14h/2 previous cycle), the trend chart, the Competency Domains panel (Digital Governance showing "(partial)"), and a Course Progress list showing his 5 courses with the right statuses.
4. Click "Back to Field Operations Division" — confirm it returns to that department's officer list (not the top-level department grid).
5. Click "Back to departments" — confirm it returns to the 6-card grid.
6. Click "Course Progress" in the sidebar — confirm the admin table renders with all officers' assignments, and that combining a department filter + a status filter narrows the results correctly; confirm "Reset filters" restores the full count.
7. Confirm Officers, Reports, Settings, Verification Audit, and the full New Assessment flow still work exactly as before (unaffected by this task).

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminCohortOverview.tsx src/pages/DiagnosticsApp.tsx
git commit -m "feat: wire department/officer drill-down and Course Progress into the admin app"
```

---

## Task 13: Final integration — full build, lint, test suite, and manual walkthrough

**Files:** none (verification only).

- [ ] **Step 1: Run the full Vitest suite**

Run: `npx vitest run`
Expected: PASS — every existing test file plus the new/extended `courses.test.ts` and `competencyDomains.test.ts` assertions from Tasks 2 and 3.

- [ ] **Step 2: Run the TypeScript build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Run the linter**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Full manual walkthrough**

Run `npm run preview` (serves the Step 2 production build) or `npm run dev`.

Palette/shape (from Task 1, re-confirm on the finished build):
1. Every page across both roles uses the corrected light neutrals — no leftover dark-theme or old-palette values anywhere.
2. Every status/semantic badge across the app (department status, course status, rejection-reason tags, competency-report "Insufficient data", officer-level pills, Settings role badge, Connect availability pills) is a full pill shape.

Officer flow:
3. `/login` → Continue as Officer → My Dashboard shows 4 stat cards plus 5 content cards (trend chart, Competency Domains, My Courses, My Department, Connect Suggestions) — genuinely dense, no empty sections.
4. My Courses shows 5 banner cards with correct status pills, progress bars, and module fractions.
5. Connect: search works by name and by expertise domain; messaging a seeded officer (Ananya Krishnan) shows the existing thread; messaging any other officer shows the empty state; sending a message appends it and clears the input.
6. Cross-navigation from the dashboard's "View all" links actually switches tabs.

Admin flow:
7. Dashboard → department card → "View officers" → officer list → click an officer → full profile with correct stats → "Back to {department}" → "Back to departments", all working.
8. Course Progress table: all 3 filters combine correctly; Reset restores the full list.
9. New Assessment (all 5 steps), Officers, Reports, Settings, Verification Audit all still work exactly as before this plan.

- [ ] **Step 5: Fix anything that fails Steps 1-4 before proceeding**

If any check fails, fix it in the file(s) it points to and re-run that check — do not mark this task done with a known-failing build, lint, or test.

- [ ] **Step 6: Final commit (only if Step 5 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in final integration pass"
```

---

## Plan Self-Review

**Spec coverage:**
- §3 palette + badge shape → Task 1.
- §4 `courses.ts` data → Task 2; officer expertise → Task 3.
- §5 `OfficerCourses` redesign → Task 4.
- §5a `OfficerDashboard` enrichment → Task 5.
- §6 Officers Connect → Tasks 6, 7.
- §7 Course Progress → Tasks 8, 9, 12.
- §8 Officer Profiles → Tasks 10, 11, 12.
- §9 nav placement → Tasks 7 (Connect tab), 9 (Course Progress nav item) — Officer Profile confirmed NOT a nav item, reached only via drill-down state in Task 12, matching the spec.
- §10 testing approach → Vitest coverage in Tasks 2/3, manual page-by-page pass in Tasks 1 and 13.
- §11 judgment calls → encoded directly in Global Constraints (`LandingPage` excluded, brand primary unchanged) and in Task 4's course-banner exception note.

**Placeholder scan:** no TBD/TODO; every step contains complete, runnable code or an exact command.

**Type consistency:** cross-checked `Course`, `CourseAssignment`, `CourseAssignmentDetail`, `CourseAssignmentFullDetail`, `AssignmentStatus`, `BannerVariant` (Task 2) against every later consumer (Tasks 4, 5, 8, 11) — names and shapes match exactly. `OfficerExpertise`/`getOfficerExpertise` (Task 3) checked against Tasks 5 and 6. `OfficerSection` (Task 7, now 3 values) checked against Task 5's locally-typed `onNavigate` prop (deliberately not importing `OfficerSection`, to keep Task 5 buildable before Task 7 runs — see Task 5's Interfaces note). `OverviewView` (Task 12) is local to `DiagnosticsApp.tsx`, not exported, no cross-task dependency risk.
