# Role-Based Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role-gated login (Officer / Coordinator-Admin), build three new pages (OfficerDashboard, AdminCohortOverview, RejectionAuditBoard) modeled on the Shadcnblocks Admin Kit reference screenshots, fully populate the admin sidebar with grouped/nested navigation, and restyle every existing screen into the same denser visual language — all on the existing locked navy design system, with zero backend.

**Architecture:** Client-side only (Vite + React 19 + TypeScript + Tailwind v4 + react-router-dom v7). A tiny `sessionStorage`-backed role gate replaces real auth. Three new mock-data modules (`officers.ts`, `competencyDomains.ts`, `departments.ts`, plus `rejectionAudit.ts` and `thresholds.ts`) sit alongside the untouched `mockData.ts` and are covered by real Vitest unit tests (this repo has no test runner today — Task 1 adds one, scoped to pure logic only). Four small shared presentational primitives (`StatCard`, `SegmentedBar`, `TrendBarChart`, `HeatSparkline`) are hand-rolled with SVG/CSS (no new chart dependency) and reused across the new pages. Every existing screen keeps its exact behavior/state logic and only gets a visual pass.

**Tech Stack:** Vite, React 19, TypeScript (strict: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` — no enums, use string-literal unions), Tailwind CSS v4 (`@theme` tokens in `src/index.css`), react-router-dom v7, @phosphor-icons/react, Vitest (new, added in Task 1).

**Spec:** `docs/superpowers/specs/2026-09-13-role-based-dashboard-redesign-design.md`

## Global Constraints

- Color palette is locked in `src/index.css` (`@theme` block) — never introduce a new color; every new UI element uses existing `--color-*` tokens (`primary`, `primary-hover`, `primary-tint`, `secondary`, `accent`, `accent-tint`, `bg`, `surface`, `surface-alt`, `border`, `border-strong`, `text-primary`, `text-secondary`, `text-muted`, `strong`/`strong-tint`, `moderate`/`moderate-tint`, `weak`/`weak-tint`, `insufficient`/`insufficient-tint`).
- No new charting/graph dependency — bar charts, segmented bars, and sparklines are hand-rolled with SVG/CSS/Tailwind, matching the existing hand-rolled heatmap in `DashboardScreen.tsx`.
- No backend, no real credential validation — role state is `sessionStorage` only (see spec §3).
- `strong`/`moderate`/`weak`/`insufficient` tokens are reserved for competency **score levels** only; categorical groupings that aren't a score (e.g. the 4 competency domains in a segmented bar) use `primary`/`secondary`/`accent`/`text-secondary` instead, never the score-level tokens (spec §11 note under AdminCohortOverview/OfficerDashboard).
- A competency/domain with no current-cycle score renders a visibly distinct "Insufficient data" treatment (dashed border, `insufficient` token) — never hidden, never silently averaged away.
- `mockData.ts` and its existing exports are never renamed or removed; all new data lives in new files under `src/data/`.
- `src/pages/LandingPage.tsx` keeps its current visual design untouched — the only change permitted there is retargeting its three `to="/app"` links to `to="/login"`.
- `GenerateScreen.tsx`'s live generated/verified/rejected counters get a visual refresh only — do **not** add a fabricated "vs previous run" comparison to them (spec §4 rationale: they're a one-shot live counter, not a periodic KPI, and a fabricated historical comparison would misrepresent what's being measured).
- The Officer shell and Admin shell must not share a component tree via a prop flag — they are separate shell components (`OfficerApp`/`OfficerTopBar` vs `DiagnosticsApp`/`AppShell`/`LeftNav`/`TopBar`).
- RejectionAuditBoard's source-document and rejection-reason filters must actually filter the rendered set — not be decorative.
- Every commit message follows this repo's existing `type: summary` convention (seen in `git log`, e.g. `feat: initialize project structure...`).

---

## Task 1: Test infrastructure (Vitest) + session role gate

**Files:**
- Modify: `package.json` (add `vitest` devDependency + `"test": "vitest run"` script)
- Create: `vitest.config.ts`
- Create: `src/lib/session.ts`
- Test: `src/lib/session.test.ts`

**Interfaces:**
- Produces: `type Role = 'officer' | 'admin'`, `getRole(): Role | null`, `setRole(role: Role): void`, `clearRole(): void` — consumed by Task 7 (`RequireRole`), Task 8 (`LoginPage`), Task 11 (`OfficerTopBar`), Task 15 (admin `TopBar`), and Task 18 (`SettingsScreen`).

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add the test script to `package.json`**

In `package.json`, inside `"scripts"`, add (keep existing scripts as-is):

```json
"test": "vitest run"
```

- [ ] **Step 3: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Write the failing test for `session.ts`**

Create `src/lib/session.test.ts`:

```ts
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
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/lib/session.test.ts`
Expected: FAIL — `session.ts` does not exist yet (module not found).

- [ ] **Step 6: Implement `session.ts`**

Create `src/lib/session.ts`:

```ts
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
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/lib/session.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/session.ts src/lib/session.test.ts
git commit -m "chore: add Vitest and a sessionStorage-backed role gate"
```

---

## Task 2: `thresholds.ts` + `officers.ts`

**Files:**
- Create: `src/data/thresholds.ts`
- Test: `src/data/thresholds.test.ts`
- Create: `src/data/officers.ts`
- Test: `src/data/officers.test.ts`

**Interfaces:**
- Produces: `STRONG_MIN = 76`, `MODERATE_MIN = 55`, `type ScoreLevel = 'strong' | 'moderate' | 'weak'`, `levelFromScore(score: number): ScoreLevel` — consumed by Task 3 (`competencyDomains.ts`), Task 4 (`departments.ts`), Task 6 (`HeatSparkline`).
- Produces: `interface Officer { id: string; name: string; departmentId: string }`, `officers: Officer[]` (30 entries across 6 department ids: `fod`, `sdm`, `dpa`, `rtcs`, `dgc`, `qaw`), `FEATURED_OFFICER_ID = 'rohit-malhotra'` — consumed by Task 3, Task 4, Task 9, Task 10, Task 11.

- [ ] **Step 1: Write the failing tests for `thresholds.ts`**

Create `src/data/thresholds.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { levelFromScore, MODERATE_MIN, STRONG_MIN } from './thresholds'

describe('levelFromScore', () => {
  it('returns strong at and above the strong threshold', () => {
    expect(levelFromScore(STRONG_MIN)).toBe('strong')
    expect(levelFromScore(90)).toBe('strong')
  })

  it('returns moderate between the two thresholds', () => {
    expect(levelFromScore(MODERATE_MIN)).toBe('moderate')
    expect(levelFromScore(STRONG_MIN - 1)).toBe('moderate')
  })

  it('returns weak below the moderate threshold', () => {
    expect(levelFromScore(MODERATE_MIN - 1)).toBe('weak')
    expect(levelFromScore(0)).toBe('weak')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/thresholds.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `thresholds.ts`**

Create `src/data/thresholds.ts`:

```ts
export const STRONG_MIN = 76
export const MODERATE_MIN = 55

export type ScoreLevel = 'strong' | 'moderate' | 'weak'

export function levelFromScore(score: number): ScoreLevel {
  if (score >= STRONG_MIN) return 'strong'
  if (score >= MODERATE_MIN) return 'moderate'
  return 'weak'
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/thresholds.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing tests for `officers.ts`**

Create `src/data/officers.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('officers', () => {
  it('has 30 officers with unique ids', () => {
    expect(officers).toHaveLength(30)
    expect(new Set(officers.map((o) => o.id)).size).toBe(30)
  })

  it('gives every officer a non-empty name and department id', () => {
    officers.forEach((officer) => {
      expect(officer.name.length).toBeGreaterThan(0)
      expect(officer.departmentId.length).toBeGreaterThan(0)
    })
  })

  it('includes the featured officer', () => {
    expect(officers.some((o) => o.id === FEATURED_OFFICER_ID)).toBe(true)
  })

  it('spreads officers across exactly 6 departments', () => {
    const departmentIds = new Set(officers.map((o) => o.departmentId))
    expect(departmentIds.size).toBe(6)
  })
})
```

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/data/officers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `officers.ts`**

Create `src/data/officers.ts`:

```ts
export interface Officer {
  id: string
  name: string
  departmentId: string
}

export const officers: Officer[] = [
  // Field Operations Division (fod)
  { id: 'rohit-malhotra', name: 'Rohit Malhotra', departmentId: 'fod' },
  { id: 'ananya-krishnan', name: 'Ananya Krishnan', departmentId: 'fod' },
  { id: 'vikram-desai', name: 'Vikram Desai', departmentId: 'fod' },
  { id: 'sunita-rao', name: 'Sunita Rao', departmentId: 'fod' },
  { id: 'manoj-tiwari', name: 'Manoj Tiwari', departmentId: 'fod' },
  // Survey Design & Methodology (sdm)
  { id: 'deepika-menon', name: 'Deepika Menon', departmentId: 'sdm' },
  { id: 'aakash-chatterjee', name: 'Aakash Chatterjee', departmentId: 'sdm' },
  { id: 'nandini-pillai', name: 'Nandini Pillai', departmentId: 'sdm' },
  { id: 'suresh-kulkarni', name: 'Suresh Kulkarni', departmentId: 'sdm' },
  { id: 'ritu-bansal', name: 'Ritu Bansal', departmentId: 'sdm' },
  // Data Processing & Analytics (dpa)
  { id: 'karthik-iyengar', name: 'Karthik Iyengar', departmentId: 'dpa' },
  { id: 'shreya-agarwal', name: 'Shreya Agarwal', departmentId: 'dpa' },
  { id: 'vivek-handa', name: 'Vivek Handa', departmentId: 'dpa' },
  { id: 'pooja-ramachandran', name: 'Pooja Ramachandran', departmentId: 'dpa' },
  { id: 'naveen-choudhary', name: 'Naveen Choudhary', departmentId: 'dpa' },
  // Regional Training Centre - South (rtcs)
  { id: 'lakshmi-venkataraman', name: 'Lakshmi Venkataraman', departmentId: 'rtcs' },
  { id: 'arjun-mehta', name: 'Arjun Mehta', departmentId: 'rtcs' },
  { id: 'divya-shenoy', name: 'Divya Shenoy', departmentId: 'rtcs' },
  { id: 'rahul-bose', name: 'Rahul Bose', departmentId: 'rtcs' },
  { id: 'swathi-reddy', name: 'Swathi Reddy', departmentId: 'rtcs' },
  // Digital Governance Cell (dgc)
  { id: 'neha-kapoor', name: 'Neha Kapoor', departmentId: 'dgc' },
  { id: 'siddharth-rane', name: 'Siddharth Rane', departmentId: 'dgc' },
  { id: 'meera-balakrishnan', name: 'Meera Balakrishnan', departmentId: 'dgc' },
  { id: 'gopal-krishnan', name: 'Gopal Krishnan', departmentId: 'dgc' },
  { id: 'isha-thakur', name: 'Isha Thakur', departmentId: 'dgc' },
  // Quality Assurance Wing (qaw)
  { id: 'amitabh-saxena', name: 'Amitabh Saxena', departmentId: 'qaw' },
  { id: 'ritika-sinha', name: 'Ritika Sinha', departmentId: 'qaw' },
  { id: 'faisal-ansari', name: 'Faisal Ansari', departmentId: 'qaw' },
  { id: 'bhavna-joshi', name: 'Bhavna Joshi', departmentId: 'qaw' },
  { id: 'tarun-gokhale', name: 'Tarun Gokhale', departmentId: 'qaw' },
]

export const FEATURED_OFFICER_ID = 'rohit-malhotra'
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src/data/officers.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 9: Commit**

```bash
git add src/data/thresholds.ts src/data/thresholds.test.ts src/data/officers.ts src/data/officers.test.ts
git commit -m "feat: add score thresholds and the department officer roster"
```

---

## Task 3: `competencyDomains.ts` — domains, taxonomy, cycles, per-officer scores

**Files:**
- Create: `src/data/competencyDomains.ts`
- Test: `src/data/competencyDomains.test.ts`

**Interfaces:**
- Consumes: `officers`, `FEATURED_OFFICER_ID` from `./officers` (Task 2); `STRONG_MIN`, `MODERATE_MIN` are not needed directly here (domain-level confidence uses `'scored' | 'partial' | 'insufficient'`, not score levels).
- Produces: `type DomainId = 'statistical' | 'technical' | 'governance' | 'behavioural'`; `interface Domain { id: DomainId; name: string; description: string }`; `domains: Domain[]`; `interface TaxonomyCompetency { id: string; label: string; domainId: DomainId }`; `taxonomyCompetencies: TaxonomyCompetency[]` (10 entries); `interface AssessmentCycle { id: string; label: string; date: string }`; `assessmentCycles: AssessmentCycle[]` (4 entries); `CURRENT_CYCLE_ID: string`; `type Confidence = 'scored' | 'insufficient'`; `interface CompetencyScore { score: number | null; confidence: Confidence }`; `interface DomainScoreSummary { score: number | null; confidence: 'scored' | 'partial' | 'insufficient' }`; `interface WeakCompetency { competency: TaxonomyCompetency; score: number }`; functions `getRawScore(officerId, cycleId, competencyId): CompetencyScore`, `getOfficerOverallScore(officerId, cycleId): number`, `getOfficerAssessedCount(officerId, cycleId): number`, `isOfficerFullyAssessed(officerId, cycleId): boolean`, `getOfficerDomainScore(officerId, domainId, cycleId): DomainScoreSummary`, `getPreviousCycleId(cycleId): string | null`, `getOfficerWeakestCompetencies(officerId, cycleId, count): WeakCompetency[]`, `getOfficerEngagement(officerId, cycleId): { learningHours: number; coursesCompleted: number }`. Consumed by Task 4 (`departments.ts`), Task 9 (`OfficerDashboard`), Task 10 (`OfficerCourses`), Task 12 (`AdminCohortOverview`).

This is the highest-bug-risk file in the plan (threshold math, partial/insufficient handling, a deterministic generator for 29 of the 30 officers). Read every step's numbers carefully — the tests below are exact-value assertions computed by hand against the featured officer's hand-authored table, not fuzzy checks.

- [ ] **Step 1: Write the failing tests**

Create `src/data/competencyDomains.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  CURRENT_CYCLE_ID,
  assessmentCycles,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerOverallScore,
  getOfficerWeakestCompetencies,
  getPreviousCycleId,
  getRawScore,
  isOfficerFullyAssessed,
  taxonomyCompetencies,
} from './competencyDomains'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('taxonomyCompetencies', () => {
  it('covers all four domains', () => {
    const domainIds = new Set(taxonomyCompetencies.map((c) => c.domainId))
    expect(domainIds).toEqual(new Set(['statistical', 'technical', 'governance', 'behavioural']))
  })

  it('has exactly 10 competencies', () => {
    expect(taxonomyCompetencies).toHaveLength(10)
  })
})

describe('getOfficerOverallScore (featured officer)', () => {
  it('computes the cycle-4 overall score excluding the insufficient competency', () => {
    expect(getOfficerOverallScore(FEATURED_OFFICER_ID, 'cycle-4')).toBe(67)
  })

  it('computes the cycle-3 overall score', () => {
    expect(getOfficerOverallScore(FEATURED_OFFICER_ID, 'cycle-3')).toBe(60)
  })
})

describe('getOfficerAssessedCount / isOfficerFullyAssessed (featured officer)', () => {
  it('counts 9 of 10 scored in cycle-4', () => {
    expect(getOfficerAssessedCount(FEATURED_OFFICER_ID, 'cycle-4')).toBe(9)
    expect(isOfficerFullyAssessed(FEATURED_OFFICER_ID, 'cycle-4')).toBe(false)
  })

  it('counts all 10 scored in cycle-3', () => {
    expect(getOfficerAssessedCount(FEATURED_OFFICER_ID, 'cycle-3')).toBe(10)
    expect(isOfficerFullyAssessed(FEATURED_OFFICER_ID, 'cycle-3')).toBe(true)
  })
})

describe('getOfficerDomainScore (featured officer, cycle-4)', () => {
  it('flags governance as partial (digital_service is insufficient this cycle)', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'governance', 'cycle-4')
    expect(result).toEqual({ score: 66, confidence: 'partial' })
  })

  it('flags behavioural as fully scored', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'behavioural', 'cycle-4')
    expect(result).toEqual({ score: 72, confidence: 'scored' })
  })

  it('flags statistical as fully scored', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'statistical', 'cycle-4')
    expect(result).toEqual({ score: 70, confidence: 'scored' })
  })
})

describe('getPreviousCycleId', () => {
  it('returns the cycle before the current one', () => {
    expect(getPreviousCycleId(CURRENT_CYCLE_ID)).toBe('cycle-3')
  })

  it('returns null for the first cycle', () => {
    expect(getPreviousCycleId('cycle-1')).toBeNull()
  })
})

describe('getOfficerWeakestCompetencies (featured officer, cycle-4)', () => {
  it('returns the two lowest-scoring competencies, ascending', () => {
    const result = getOfficerWeakestCompetencies(FEATURED_OFFICER_ID, 'cycle-4', 2)
    expect(result.map((r) => r.competency.id)).toEqual(['data_automation', 'computation'])
    expect(result.map((r) => r.score)).toEqual([52, 57])
  })
})

describe('getOfficerEngagement', () => {
  it('returns the featured officer\'s hand-authored engagement for cycle-4', () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-4')).toEqual({
      learningHours: 22,
      coursesCompleted: 4,
    })
  })

  it('returns zeros for an officer/cycle with no recorded engagement', () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-1')).toEqual({
      learningHours: 0,
      coursesCompleted: 0,
    })
  })
})

describe('generated officers (deterministic, non-featured)', () => {
  const otherOfficerId = officers.find((o) => o.id !== FEATURED_OFFICER_ID)!.id

  it('is deterministic across repeated calls', () => {
    const first = getOfficerOverallScore(otherOfficerId, CURRENT_CYCLE_ID)
    const second = getOfficerOverallScore(otherOfficerId, CURRENT_CYCLE_ID)
    expect(first).toBe(second)
  })

  it('keeps every scored value within the valid 15-97 range', () => {
    for (const officer of officers) {
      if (officer.id === FEATURED_OFFICER_ID) continue
      for (const cycle of assessmentCycles) {
        for (const competency of taxonomyCompetencies) {
          const entry = getRawScore(officer.id, cycle.id, competency.id)
          if (entry.confidence === 'scored') {
            expect(entry.score).toBeGreaterThanOrEqual(15)
            expect(entry.score).toBeLessThanOrEqual(97)
          }
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/competencyDomains.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `competencyDomains.ts`**

Create `src/data/competencyDomains.ts`:

```ts
import { FEATURED_OFFICER_ID, officers } from './officers'

export type DomainId = 'statistical' | 'technical' | 'governance' | 'behavioural'

export interface Domain {
  id: DomainId
  name: string
  description: string
}

export const domains: Domain[] = [
  {
    id: 'statistical',
    name: 'Statistical Competency',
    description: 'Core survey, sampling, and estimation methodology.',
  },
  {
    id: 'technical',
    name: 'Technical & AI Competency',
    description: 'Applied AI/ML tooling and data automation skills.',
  },
  {
    id: 'governance',
    name: 'Digital Governance',
    description: 'Data privacy, security, and digital service delivery standards.',
  },
  {
    id: 'behavioural',
    name: 'Behavioural Competency',
    description: 'Communication, ethics, and judgement in applying AI to official statistics.',
  },
]

export interface TaxonomyCompetency {
  id: string
  label: string
  domainId: DomainId
}

export const taxonomyCompetencies: TaxonomyCompetency[] = [
  { id: 'sampling', label: 'Sampling methodology', domainId: 'statistical' },
  { id: 'survey', label: 'Survey design', domainId: 'statistical' },
  { id: 'quality', label: 'Data quality standards', domainId: 'statistical' },
  { id: 'computation', label: 'Statistical computation', domainId: 'statistical' },
  { id: 'ai_fundamentals', label: 'AI/ML Fundamentals for Official Statistics', domainId: 'technical' },
  { id: 'data_automation', label: 'Data Automation & Scripting Tools', domainId: 'technical' },
  { id: 'data_privacy', label: 'Data Privacy & Security Standards', domainId: 'governance' },
  { id: 'digital_service', label: 'Digital Service Delivery Standards (GIGW)', domainId: 'governance' },
  { id: 'stakeholder_comm', label: 'Stakeholder Communication & Reporting', domainId: 'behavioural' },
  { id: 'ethical_ai', label: 'Ethical Use of AI in Decision-Making', domainId: 'behavioural' },
]

export interface AssessmentCycle {
  id: string
  label: string
  date: string
}

export const assessmentCycles: AssessmentCycle[] = [
  { id: 'cycle-1', label: 'Cycle 1', date: '2025-03-10' },
  { id: 'cycle-2', label: 'Cycle 2', date: '2025-07-14' },
  { id: 'cycle-3', label: 'Cycle 3', date: '2026-01-19' },
  { id: 'cycle-4', label: 'Cycle 4 (Current)', date: '2026-08-24' },
]

export const CURRENT_CYCLE_ID = assessmentCycles[assessmentCycles.length - 1].id

export type Confidence = 'scored' | 'insufficient'

export interface CompetencyScore {
  score: number | null
  confidence: Confidence
}

type ScoreTable = Record<string, Record<string, Record<string, CompetencyScore>>>

// Hand-authored so the officer dashboard's flagship demo path (Rohit Malhotra) tells a
// deliberate, honest story: steady improvement, one legacy gap that closed (ethical_ai),
// and one gap newly opened this cycle (digital_service) to exercise the "insufficient
// data must be visible" requirement on the default (current-cycle) view.
const ROHIT_SCORES: Record<string, Record<string, CompetencyScore>> = {
  'cycle-1': {
    sampling: { score: 58, confidence: 'scored' },
    survey: { score: 52, confidence: 'scored' },
    quality: { score: 61, confidence: 'scored' },
    computation: { score: 45, confidence: 'scored' },
    ai_fundamentals: { score: 30, confidence: 'scored' },
    data_automation: { score: 25, confidence: 'scored' },
    data_privacy: { score: 48, confidence: 'scored' },
    digital_service: { score: 40, confidence: 'scored' },
    stakeholder_comm: { score: 66, confidence: 'scored' },
    ethical_ai: { score: null, confidence: 'insufficient' },
  },
  'cycle-2': {
    sampling: { score: 64, confidence: 'scored' },
    survey: { score: 57, confidence: 'scored' },
    quality: { score: 65, confidence: 'scored' },
    computation: { score: 48, confidence: 'scored' },
    ai_fundamentals: { score: 41, confidence: 'scored' },
    data_automation: { score: 33, confidence: 'scored' },
    data_privacy: { score: 54, confidence: 'scored' },
    digital_service: { score: 46, confidence: 'scored' },
    stakeholder_comm: { score: 70, confidence: 'scored' },
    ethical_ai: { score: null, confidence: 'insufficient' },
  },
  'cycle-3': {
    sampling: { score: 71, confidence: 'scored' },
    survey: { score: 63, confidence: 'scored' },
    quality: { score: 70, confidence: 'scored' },
    computation: { score: 53, confidence: 'scored' },
    ai_fundamentals: { score: 55, confidence: 'scored' },
    data_automation: { score: 44, confidence: 'scored' },
    data_privacy: { score: 60, confidence: 'scored' },
    digital_service: { score: 53, confidence: 'scored' },
    stakeholder_comm: { score: 74, confidence: 'scored' },
    ethical_ai: { score: 58, confidence: 'scored' },
  },
  'cycle-4': {
    sampling: { score: 78, confidence: 'scored' },
    survey: { score: 69, confidence: 'scored' },
    quality: { score: 74, confidence: 'scored' },
    computation: { score: 57, confidence: 'scored' },
    ai_fundamentals: { score: 68, confidence: 'scored' },
    data_automation: { score: 52, confidence: 'scored' },
    data_privacy: { score: 66, confidence: 'scored' },
    digital_service: { score: null, confidence: 'insufficient' },
    stakeholder_comm: { score: 79, confidence: 'scored' },
    ethical_ai: { score: 64, confidence: 'scored' },
  },
}

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

function clampScore(value: number): number {
  return Math.max(15, Math.min(97, Math.round(value)))
}

// Fabricated per-department skill bias so the department cards built in Task 4/12 show
// a believable spread of On Track / At Risk / Critical rather than one flat cluster.
const DEPARTMENT_BIAS: Record<string, number> = {
  fod: 0,
  sdm: -5,
  dpa: 3,
  rtcs: -8,
  dgc: 14,
  qaw: -18,
}

const CYCLE_GROWTH = [0, 6, 12, 18]

function generateOfficerScores(
  officerId: string,
  departmentId: string,
): Record<string, Record<string, CompetencyScore>> {
  const bias = DEPARTMENT_BIAS[departmentId] ?? 0
  const table: Record<string, Record<string, CompetencyScore>> = {}
  assessmentCycles.forEach((cycle) => {
    table[cycle.id] = {}
  })

  const gapRand = mulberry32(hashString(`${officerId}:current-gap`))
  const hasCurrentGap = gapRand() < 0.25
  const currentGapIndex = Math.floor(gapRand() * taxonomyCompetencies.length)

  taxonomyCompetencies.forEach((competency, competencyIndex) => {
    const rand = mulberry32(hashString(`${officerId}:${competency.id}`))
    const base = 35 + rand() * 35 + bias
    const earlyGapChance = rand()

    assessmentCycles.forEach((cycle, cycleIndex) => {
      const isCurrentCycle = cycleIndex === assessmentCycles.length - 1
      const isEarlyGap = cycleIndex < 2 && earlyGapChance < 0.12
      const isCurrentGap = isCurrentCycle && hasCurrentGap && competencyIndex === currentGapIndex

      if (isEarlyGap || isCurrentGap) {
        table[cycle.id][competency.id] = { score: null, confidence: 'insufficient' }
        return
      }

      const score = clampScore(base + CYCLE_GROWTH[cycleIndex] + (rand() - 0.5) * 6)
      table[cycle.id][competency.id] = { score, confidence: 'scored' }
    })
  })

  return table
}

const scoreTable: ScoreTable = {
  [FEATURED_OFFICER_ID]: ROHIT_SCORES,
}

for (const officer of officers) {
  if (officer.id === FEATURED_OFFICER_ID) continue
  scoreTable[officer.id] = generateOfficerScores(officer.id, officer.departmentId)
}

export function getRawScore(officerId: string, cycleId: string, competencyId: string): CompetencyScore {
  return scoreTable[officerId]?.[cycleId]?.[competencyId] ?? { score: null, confidence: 'insufficient' }
}

export function getOfficerOverallScore(officerId: string, cycleId: string): number {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  if (!cycleScores) return 0
  const scored = Object.values(cycleScores).filter(
    (entry): entry is { score: number; confidence: 'scored' } =>
      entry.confidence === 'scored' && entry.score !== null,
  )
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
}

export function getOfficerAssessedCount(officerId: string, cycleId: string): number {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  if (!cycleScores) return 0
  return Object.values(cycleScores).filter((entry) => entry.confidence === 'scored').length
}

export function isOfficerFullyAssessed(officerId: string, cycleId: string): boolean {
  return getOfficerAssessedCount(officerId, cycleId) === taxonomyCompetencies.length
}

export interface DomainScoreSummary {
  score: number | null
  confidence: 'scored' | 'partial' | 'insufficient'
}

export function getOfficerDomainScore(
  officerId: string,
  domainId: DomainId,
  cycleId: string,
): DomainScoreSummary {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  const competencyIds = taxonomyCompetencies.filter((c) => c.domainId === domainId).map((c) => c.id)
  if (!cycleScores) return { score: null, confidence: 'insufficient' }

  const entries = competencyIds.map((id) => cycleScores[id])
  const scored = entries.filter(
    (entry): entry is { score: number; confidence: 'scored' } =>
      entry.confidence === 'scored' && entry.score !== null,
  )

  if (scored.length === 0) return { score: null, confidence: 'insufficient' }

  const avg = Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
  return { score: avg, confidence: scored.length === entries.length ? 'scored' : 'partial' }
}

export function getPreviousCycleId(cycleId: string): string | null {
  const index = assessmentCycles.findIndex((cycle) => cycle.id === cycleId)
  if (index <= 0) return null
  return assessmentCycles[index - 1].id
}

export interface WeakCompetency {
  competency: TaxonomyCompetency
  score: number
}

export function getOfficerWeakestCompetencies(
  officerId: string,
  cycleId: string,
  count: number,
): WeakCompetency[] {
  const cycleScores = scoreTable[officerId]?.[cycleId] ?? {}
  const scored = taxonomyCompetencies
    .map((competency) => ({ competency, entry: cycleScores[competency.id] }))
    .filter(
      (item): item is { competency: TaxonomyCompetency; entry: { score: number; confidence: 'scored' } } =>
        item.entry?.confidence === 'scored' && item.entry.score !== null,
    )
    .map((item) => ({ competency: item.competency, score: item.entry.score }))

  return scored.sort((a, b) => a.score - b.score).slice(0, count)
}

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

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/competencyDomains.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/competencyDomains.ts src/data/competencyDomains.test.ts
git commit -m "feat: add the competency domain taxonomy, cycles, and officer scoring"
```

---

## Task 4: `departments.ts` — department roster, status derivation

**Files:**
- Create: `src/data/departments.ts`
- Test: `src/data/departments.test.ts`

**Interfaces:**
- Consumes: `officers` from `./officers` (Task 2); `STRONG_MIN`, `MODERATE_MIN` from `./thresholds` (Task 2); `getOfficerOverallScore`, `isOfficerFullyAssessed`, `CURRENT_CYCLE_ID` from `./competencyDomains` (Task 3).
- Produces: `interface Department { id: string; code: string; name: string; nextReviewDate: string }`, `departments: Department[]` (6 entries), `type DepartmentStatus = 'on_track' | 'at_risk' | 'critical'`, `getDepartmentOfficers(departmentId): Officer[]`, `getDepartmentAvgScore(departmentId): number`, `getDepartmentStatus(departmentId): DepartmentStatus`, `getDepartmentAssessedFraction(departmentId): { assessed: number; total: number }`. Consumed by Task 12 (`AdminCohortOverview`).

- [ ] **Step 1: Write the failing tests**

Create `src/data/departments.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  departments,
  getDepartmentAssessedFraction,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from './departments'
import { officers } from './officers'

describe('departments', () => {
  it('has 6 departments with unique ids and codes', () => {
    expect(departments).toHaveLength(6)
    expect(new Set(departments.map((d) => d.id)).size).toBe(6)
    expect(new Set(departments.map((d) => d.code)).size).toBe(6)
  })

  it('accounts for every officer across exactly the department ids that exist', () => {
    const departmentIds = new Set(departments.map((d) => d.id))
    officers.forEach((officer) => expect(departmentIds.has(officer.departmentId)).toBe(true))
  })
})

describe('getDepartmentOfficers', () => {
  it('returns only officers belonging to that department', () => {
    const fodOfficers = getDepartmentOfficers('fod')
    expect(fodOfficers.length).toBeGreaterThan(0)
    fodOfficers.forEach((officer) => expect(officer.departmentId).toBe('fod'))
  })
})

describe('getDepartmentAvgScore / getDepartmentStatus', () => {
  it('derives a status consistent with the average score and the shared thresholds', () => {
    departments.forEach((department) => {
      const avg = getDepartmentAvgScore(department.id)
      const status = getDepartmentStatus(department.id)
      if (avg >= 76) expect(status).toBe('on_track')
      else if (avg >= 55) expect(status).toBe('at_risk')
      else expect(status).toBe('critical')
    })
  })

  it('produces at least two different statuses across the 6 departments', () => {
    const statuses = new Set(departments.map((d) => getDepartmentStatus(d.id)))
    expect(statuses.size).toBeGreaterThan(1)
  })
})

describe('getDepartmentAssessedFraction', () => {
  it('never reports more assessed officers than the department total', () => {
    departments.forEach((department) => {
      const { assessed, total } = getDepartmentAssessedFraction(department.id)
      expect(total).toBe(getDepartmentOfficers(department.id).length)
      expect(assessed).toBeLessThanOrEqual(total)
      expect(assessed).toBeGreaterThanOrEqual(0)
    })
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/departments.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `departments.ts`**

Create `src/data/departments.ts`:

```ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/departments.test.ts`
Expected: PASS (all tests)

If the "at least two different statuses" test fails because the department bias constants in
`competencyDomains.ts` happen to cluster all 6 departments into one status band, adjust the
`DEPARTMENT_BIAS` values there (Task 3) wider apart — do not weaken this test, the whole point
of AdminCohortOverview (Task 12) is showing a real spread of On Track / At Risk / Critical.

- [ ] **Step 5: Commit**

```bash
git add src/data/departments.ts src/data/departments.test.ts
git commit -m "feat: add department roster with derived on-track/at-risk/critical status"
```

---

## Task 5: `rejectionAudit.ts` — verification-pipeline mock fixture

**Files:**
- Create: `src/data/rejectionAudit.ts`
- Test: `src/data/rejectionAudit.test.ts`

**Interfaces:**
- Produces: `type AuditStatus = 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'`, `type RejectionReason = 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null`, `type VerificationPass = 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'`, `interface RejectionAuditItem { id, questionId, questionText, sourceDocument, status: AuditStatus, rejectionReason: RejectionReason, verificationPass: VerificationPass, reviewedAt: string, confidenceScore: number | null }`, `sourceDocuments: readonly string[]`, `rejectionReasonLabels: Record<Exclude<RejectionReason, null>, string>`, `verificationPassLabels: Record<VerificationPass, string>`, `mockRejectionAuditItems: RejectionAuditItem[]` (18 entries), `filterAuditItems(items, filters: { sourceDocument?: string; rejectionReason?: RejectionReason }): RejectionAuditItem[]`. Consumed by Task 13 (`RejectionAuditBoard`).

- [ ] **Step 1: Write the failing tests**

Create `src/data/rejectionAudit.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { filterAuditItems, mockRejectionAuditItems } from './rejectionAudit'

const VALID_STATUSES = ['rejected', 'needs_manual_review', 'verified', 'flagged']

describe('mockRejectionAuditItems', () => {
  it('has 18 items, each with a valid board status', () => {
    expect(mockRejectionAuditItems).toHaveLength(18)
    mockRejectionAuditItems.forEach((item) => expect(VALID_STATUSES).toContain(item.status))
  })

  it('has unique ids', () => {
    const ids = new Set(mockRejectionAuditItems.map((item) => item.id))
    expect(ids.size).toBe(mockRejectionAuditItems.length)
  })

  it('covers all four board statuses', () => {
    const statuses = new Set(mockRejectionAuditItems.map((item) => item.status))
    expect(statuses).toEqual(new Set(VALID_STATUSES))
  })
})

describe('filterAuditItems', () => {
  it('returns everything when no filters are given', () => {
    expect(filterAuditItems(mockRejectionAuditItems, {})).toHaveLength(mockRejectionAuditItems.length)
  })

  it('filters by source document only', () => {
    const result = filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.sourceDocument === 'MoSPI_Data_Quality_Standards_v3.pdf')).toBe(true)
  })

  it('filters by rejection reason only', () => {
    const result = filterAuditItems(mockRejectionAuditItems, { rejectionReason: 'low_confidence' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.rejectionReason === 'low_confidence')).toBe(true)
  })

  it('combines both filters', () => {
    const result = filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
      rejectionReason: 'failed_span_match',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((item) => {
      expect(item.sourceDocument).toBe('ISS_Reference_Manual_Ch4_Sampling.pdf')
      expect(item.rejectionReason).toBe('failed_span_match')
    })
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/rejectionAudit.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `rejectionAudit.ts`**

Create `src/data/rejectionAudit.ts`:

```ts
// MOCK FIXTURE — reconcile with backend rejection-logging schema when available.
// Expected real fields once question verification is backend-logged:
//   id: string
//   questionId: string
//   questionText: string
//   sourceDocument: string
//   status: 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'
//   rejectionReason: 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null
//   verificationPass: 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'
//   reviewedAt: string (ISO timestamp)
//   confidenceScore: number | null

export type AuditStatus = 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'
export type RejectionReason = 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null
export type VerificationPass = 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'

export interface RejectionAuditItem {
  id: string
  questionId: string
  questionText: string
  sourceDocument: string
  status: AuditStatus
  rejectionReason: RejectionReason
  verificationPass: VerificationPass
  reviewedAt: string
  confidenceScore: number | null
}

export const sourceDocuments = [
  'ISS_Reference_Manual_Ch4_Sampling.pdf',
  'NSS_Survey_Design_Handbook_2025.pdf',
  'MoSPI_Data_Quality_Standards_v3.pdf',
  'NSSTA_AI_Competency_Curriculum_Notes.pdf',
] as const

export const rejectionReasonLabels: Record<Exclude<RejectionReason, null>, string> = {
  failed_span_match: 'Failed span match',
  failed_semantic_support: 'Failed semantic support',
  low_confidence: 'Low confidence',
}

export const verificationPassLabels: Record<VerificationPass, string> = {
  first_pass_llm: 'First-pass LLM',
  deterministic_check: 'Deterministic check',
  second_pass_adversarial: 'Second-pass adversarial review',
}

export const mockRejectionAuditItems: RejectionAuditItem[] = [
  {
    id: 'ra-001',
    questionId: 'q84',
    questionText:
      'In stratified random sampling, allocating a larger share of the sample to strata with higher internal variability is known as which allocation method, and how does it differ from proportional allocation in variance reduction terms?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'rejected',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-10T09:12:00+05:30',
    confidenceScore: 0.41,
  },
  {
    id: 'ra-002',
    questionId: 'q112',
    questionText:
      'Which recall period does standard NSS practice prescribe for measuring household consumption of durable goods, and what is the stated rationale for using a longer window than for frequently purchased items?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'rejected',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-10T09:47:00+05:30',
    confidenceScore: 0.38,
  },
  {
    id: 'ra-003',
    questionId: 'q63',
    questionText:
      'A simple random sample of n households yields a given sample standard deviation; compute the approximate standard error of the mean and identify which formula was applied.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'rejected',
    rejectionReason: 'low_confidence',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-10T10:03:00+05:30',
    confidenceScore: 0.29,
  },
  {
    id: 'ra-004',
    questionId: 'q147',
    questionText:
      'Which of the UN Fundamental Principles of Official Statistics addresses the prevention of misuse of statistics, and what obligation does it place on producing agencies?',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'rejected',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-10T10:21:00+05:30',
    confidenceScore: 0.44,
  },
  {
    id: 'ra-005',
    questionId: 'q158',
    questionText:
      'An officer uses a large language model to auto-classify survey responses; which governance safeguard is required before the classifications are published as an official statistic?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'rejected',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-10T11:05:00+05:30',
    confidenceScore: 0.35,
  },
  {
    id: 'ra-006',
    questionId: 'q092',
    questionText:
      'Compare Neyman allocation and equal allocation for a stratified design with three strata of unequal variance, and state which minimizes the variance of the estimator.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'low_confidence',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-11T08:40:00+05:30',
    confidenceScore: 0.54,
  },
  {
    id: 'ra-007',
    questionId: 'q101',
    questionText:
      'What distinguishes a rotating panel design from a fresh cross-sectional sample in successive NSS survey rounds?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-11T09:15:00+05:30',
    confidenceScore: 0.49,
  },
  {
    id: 'ra-008',
    questionId: 'q118',
    questionText:
      'Identify the data quality dimension violated when two administrative sources report conflicting population totals for the same district and period.',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-11T09:58:00+05:30',
    confidenceScore: 0.51,
  },
  {
    id: 'ra-009',
    questionId: 'q133',
    questionText:
      "A training officer wants to explain model confidence scores to a non-technical review committee; which explanation avoids overstating the model's certainty?",
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'low_confidence',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-11T10:32:00+05:30',
    confidenceScore: 0.47,
  },
  {
    id: 'ra-010',
    questionId: 'q140',
    questionText:
      'Given a coefficient-of-variation threshold for publishable estimates, determine whether a district-level estimate with CV of 34% should be released with a caveat or suppressed.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-11T11:10:00+05:30',
    confidenceScore: 0.52,
  },
  {
    id: 'ra-011',
    questionId: 'q021',
    questionText:
      'Under standard NSS practice, which recall period is used for frequently purchased items such as food and personal care?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-09T09:00:00+05:30',
    confidenceScore: 0.92,
  },
  {
    id: 'ra-012',
    questionId: 'q033',
    questionText:
      'Which of the ten UN Fundamental Principles of Official Statistics concerns professional standards, scientific principles, and ethics?',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-09T09:45:00+05:30',
    confidenceScore: 0.95,
  },
  {
    id: 'ra-013',
    questionId: 'q048',
    questionText: 'For n = 400 and sample standard deviation 25, what is the standard error of the sample mean?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-09T10:22:00+05:30',
    confidenceScore: 0.97,
  },
  {
    id: 'ra-014',
    questionId: 'q055',
    questionText: 'What safeguard does the NSSTA curriculum require before an AI-drafted question bank is administered to officers?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-09T11:03:00+05:30',
    confidenceScore: 0.9,
  },
  {
    id: 'ra-015',
    questionId: 'q067',
    questionText:
      'Which allocation method assigns larger sub-samples to strata with greater internal standard deviation for a fixed total sample size?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-09T11:41:00+05:30',
    confidenceScore: 0.94,
  },
  {
    id: 'ra-016',
    questionId: 'q072',
    questionText:
      'A generated question cites page 41 of the source manual, but the manual has only 38 pages; what verification step should have caught this before publication?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'flagged',
    rejectionReason: 'failed_span_match',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-12T08:15:00+05:30',
    confidenceScore: 0.22,
  },
  {
    id: 'ra-017',
    questionId: 'q089',
    questionText:
      'Two generated questions share an identical answer key despite testing different competencies; which pipeline stage should de-duplicate these before officer assignment?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'flagged',
    rejectionReason: 'low_confidence',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-12T08:52:00+05:30',
    confidenceScore: 0.31,
  },
  {
    id: 'ra-018',
    questionId: 'q096',
    questionText:
      'A question about AI model bias references a passage on sampling bias instead; which failure mode does this represent in the source-grounding pipeline?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'flagged',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-12T09:30:00+05:30',
    confidenceScore: 0.27,
  },
]

export function filterAuditItems(
  items: RejectionAuditItem[],
  filters: { sourceDocument?: string; rejectionReason?: RejectionReason },
): RejectionAuditItem[] {
  return items.filter((item) => {
    if (filters.sourceDocument && item.sourceDocument !== filters.sourceDocument) return false
    if (filters.rejectionReason !== undefined && item.rejectionReason !== filters.rejectionReason) return false
    return true
  })
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/rejectionAudit.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/rejectionAudit.ts src/data/rejectionAudit.test.ts
git commit -m "feat: add the rejection-audit mock fixture and filter helper"
```

---

## Task 6: Shared presentational primitives

**Files:**
- Create: `src/components/shared/StatCard.tsx`
- Create: `src/components/shared/SegmentedBar.tsx`
- Create: `src/components/shared/TrendBarChart.tsx`
- Create: `src/components/shared/HeatSparkline.tsx`

**Interfaces:**
- Consumes: `levelFromScore` from `../../data/thresholds` (Task 2, in `HeatSparkline` only).
- Produces: `StatCard(props: { label: string; value: string; previousLabel: string; deltaLabel: string; trend: 'up' | 'down'; icon?: Icon })`; `SegmentedBar(props: { segments: { id: string; label: string; value: number; colorClass: string }[] })`; `TrendBarChart(props: { points: { label: string; value: number }[]; maxValue?: number })`; `HeatSparkline(props: { cells: { id: string; label: string; score: number | null }[] })`. `StatCard`/`SegmentedBar`/`TrendBarChart` consumed by Task 9 (`OfficerDashboard`); `HeatSparkline` consumed by Task 12 (`AdminCohortOverview`).

No component test runner exists in this repo (Vitest here covers pure logic only, per the spec's testing approach — see spec §12). Verification for this task is TypeScript compilation now; visual confirmation happens naturally when Tasks 10 and 12 render these components in the browser.

- [ ] **Step 1: Implement `StatCard.tsx`**

Create `src/components/shared/StatCard.tsx`:

```tsx
import { TrendDown, TrendUp } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

interface StatCardProps {
  label: string
  value: string
  previousLabel: string
  deltaLabel: string
  trend: 'up' | 'down'
  icon?: Icon
}

export function StatCard({ label, value, previousLabel, deltaLabel, trend, icon: ItemIcon }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendUp : TrendDown
  const trendToneClass = trend === 'up' ? 'text-strong' : 'text-weak'

  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption text-text-secondary">{label}</p>
        {ItemIcon && <ItemIcon size={16} className="text-text-muted" />}
      </div>
      <p className="mt-2 text-metric font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="mt-1 text-caption text-text-muted">{previousLabel}</p>
      <p className={`mt-1 flex items-center gap-1 text-caption font-medium ${trendToneClass}`}>
        <TrendIcon size={13} weight="bold" />
        {deltaLabel}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Implement `SegmentedBar.tsx`**

Create `src/components/shared/SegmentedBar.tsx`:

```tsx
interface SegmentedBarSegment {
  id: string
  label: string
  value: number
  colorClass: string
}

interface SegmentedBarProps {
  segments: SegmentedBarSegment[]
}

export function SegmentedBar({ segments }: SegmentedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-sm bg-surface-alt">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={segment.colorClass}
            style={{ width: total > 0 ? `${(segment.value / total) * 100}%` : '0%' }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.id} className="flex items-center gap-1.5 text-caption text-text-secondary">
            <span className={`size-2 rounded-full ${segment.colorClass}`} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement `TrendBarChart.tsx`**

Create `src/components/shared/TrendBarChart.tsx`:

```tsx
interface TrendBarChartPoint {
  label: string
  value: number
}

interface TrendBarChartProps {
  points: TrendBarChartPoint[]
  maxValue?: number
}

export function TrendBarChart({ points, maxValue = 100 }: TrendBarChartProps) {
  return (
    <div className="flex h-40 items-end gap-3">
      {points.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end">
            <div
              className="w-full rounded-t-sm bg-primary"
              style={{ height: `${Math.max(4, (point.value / maxValue) * 100)}%` }}
              title={`${point.label}: ${point.value}%`}
            />
          </div>
          <span className="text-micro text-text-muted">{point.label}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Implement `HeatSparkline.tsx`**

Create `src/components/shared/HeatSparkline.tsx`:

```tsx
import { levelFromScore } from '../../data/thresholds'

interface HeatSparklineCell {
  id: string
  label: string
  score: number | null
}

interface HeatSparklineProps {
  cells: HeatSparklineCell[]
}

const levelClass: Record<'strong' | 'moderate' | 'weak' | 'insufficient', string> = {
  strong: 'bg-strong',
  moderate: 'bg-moderate',
  weak: 'bg-weak',
  insufficient: 'bg-insufficient',
}

export function HeatSparkline({ cells }: HeatSparklineProps) {
  return (
    <div className="flex gap-1">
      {cells.map((cell) => {
        const level = cell.score === null ? 'insufficient' : levelFromScore(cell.score)
        return (
          <span
            key={cell.id}
            title={`${cell.label}: ${cell.score === null ? 'Insufficient data' : `${cell.score}%`}`}
            className={`h-5 flex-1 rounded-sm ${levelClass[level]}`}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from the 4 new files (pre-existing errors, if any, are out of scope for this task).

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/StatCard.tsx src/components/shared/SegmentedBar.tsx src/components/shared/TrendBarChart.tsx src/components/shared/HeatSparkline.tsx
git commit -m "feat: add shared StatCard, SegmentedBar, TrendBarChart, and HeatSparkline primitives"
```

---

## Task 7: `RequireRole` route guard

**Files:**
- Create: `src/components/shared/RequireRole.tsx`

**Interfaces:**
- Consumes: `getRole`, `type Role` from `../../lib/session` (Task 1).
- Produces: `RequireRole(props: { role: Role; children: ReactNode })`. Consumed by Task 11 (`App.tsx` routing).

- [ ] **Step 1: Implement `RequireRole.tsx`**

Create `src/components/shared/RequireRole.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/RequireRole.tsx
git commit -m "feat: add the RequireRole route guard"
```

---

## Task 8: `LoginPage`

**Files:**
- Create: `src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes: `setRole` from `../lib/session` (Task 1); `org` from `../mockData` (existing, unchanged).
- Produces: `LoginPage()` — the `/login` route element. Consumed by Task 11 (`App.tsx` routing).

- [ ] **Step 1: Implement `LoginPage.tsx`**

Create `src/pages/LoginPage.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: add the role-picker login page"
```

---

## Task 9: `OfficerDashboard`

**Files:**
- Create: `src/components/officer/OfficerDashboard.tsx`

**Interfaces:**
- Consumes: `officers`, `FEATURED_OFFICER_ID` from `../../data/officers` (Task 2); `domains`, `type DomainId`, `CURRENT_CYCLE_ID`, `assessmentCycles`, `getOfficerAssessedCount`, `getOfficerDomainScore`, `getOfficerEngagement`, `getOfficerOverallScore`, `getPreviousCycleId`, `taxonomyCompetencies` from `../../data/competencyDomains` (Task 3); `StatCard` from `../shared/StatCard`, `SegmentedBar` from `../shared/SegmentedBar`, `TrendBarChart` from `../shared/TrendBarChart` (Task 6).
- Produces: `OfficerDashboard()`. Consumed by Task 11 (`OfficerApp` shell).

- [ ] **Step 1: Implement `OfficerDashboard.tsx`**

Create `src/components/officer/OfficerDashboard.tsx`:

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
  getOfficerOverallScore,
  getPreviousCycleId,
  taxonomyCompetencies,
} from '../../data/competencyDomains'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

export function OfficerDashboard() {
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
                value: entry.score ?? 0,
                colorClass: domainColorClass[entry.domain.id],
              }))}
            />
          </div>

          <div className="mt-4 divide-y divide-border">
            {domainScores.map((entry) => (
              <div key={entry.domain.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-body text-text-primary">{entry.domain.name}</span>
                {entry.confidence === 'insufficient' ? (
                  <span className="rounded-sm border border-dashed border-insufficient bg-surface px-2 py-0.5 text-micro font-medium text-insufficient">
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
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/officer/OfficerDashboard.tsx
git commit -m "feat: add OfficerDashboard"
```

---

## Task 10: `OfficerCourses`

**Files:**
- Create: `src/components/officer/OfficerCourses.tsx`

**Interfaces:**
- Consumes: `mockCourseCatalog` from `../../mockData` (existing, unchanged); `officers`, `FEATURED_OFFICER_ID` from `../../data/officers` (Task 2); `CURRENT_CYCLE_ID`, `getOfficerWeakestCompetencies` from `../../data/competencyDomains` (Task 3).
- Produces: `OfficerCourses()`. Consumed by Task 11 (`OfficerApp` shell).

This reuses the existing global `mockCourseCatalog` data (3 fabricated iGOT courses) rather than duplicating course content, and pairs each course with the featured officer's own lowest-scoring competencies from Task 3 — it does not reuse `RecommendationsScreen`'s cohort-wide ranking logic, because that logic ranks courses by how many of the *original 8-officer cohort* need them, which has no meaning for a single officer on the new roster.

- [ ] **Step 1: Implement `OfficerCourses.tsx`**

Create `src/components/officer/OfficerCourses.tsx`:

```tsx
import { CURRENT_CYCLE_ID, getOfficerWeakestCompetencies } from '../../data/competencyDomains'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'
import { mockCourseCatalog } from '../../mockData'

export function OfficerCourses() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const weakest = getOfficerWeakestCompetencies(officer.id, CURRENT_CYCLE_ID, mockCourseCatalog.length)

  const assignments = mockCourseCatalog.map((course, index) => ({
    course,
    competency: weakest[index]?.competency,
    score: weakest[index]?.score,
  }))

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">My Courses</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        Training recommended for {officer.name.split(' ')[0]} based on this cycle&apos;s lowest-scoring
        competencies.
      </p>

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {assignments.map(({ course, competency, score }) => (
          <div key={course.title} className="bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                {course.provider}
              </span>
              <span className="text-micro text-text-muted">{course.format}</span>
            </div>
            <h2 className="mt-1.5 text-h1 font-semibold text-text-primary">{course.title}</h2>
            {competency && (
              <p className="mt-1.5 text-body text-text-secondary">
                Targets <span className="font-medium text-text-primary">{competency.label}</span>, your
                current lowest score at {score}%.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/officer/OfficerCourses.tsx
git commit -m "feat: add OfficerCourses"
```

---

## Task 11: Officer shell + full routing wire-up (first end-to-end checkpoint)

**Files:**
- Create: `src/components/officer/OfficerTopBar.tsx`
- Create: `src/pages/OfficerApp.tsx`
- Modify: `src/App.tsx` (full rewrite)
- Modify: `src/pages/LandingPage.tsx` (3 occurrences of `to="/app"` → `to="/login"`, lines 84, 156, 406 — no other changes to this file)

**Interfaces:**
- Consumes: `clearRole` from `../../lib/session` (Task 1); `officers`, `FEATURED_OFFICER_ID` from `../../data/officers` (Task 2); `OfficerDashboard` (Task 9), `OfficerCourses` (Task 10); `RequireRole` (Task 7); `LoginPage` (Task 8); `DiagnosticsApp`, `LandingPage` (existing, unchanged).
- Produces: `type OfficerSection = 'dashboard' | 'courses'`, `OfficerTopBar(props: { activeSection: OfficerSection; onSelectSection: (s: OfficerSection) => void })`, `OfficerApp()`. `App.tsx` now serves `/`, `/login`, `/app` (guarded, role `admin`), `/officer` (guarded, role `officer`).

This is the first task where the full officer flow becomes reachable and testable in a browser — do the manual verification in Step 4, don't skip it.

- [ ] **Step 1: Implement `OfficerTopBar.tsx`**

Create `src/components/officer/OfficerTopBar.tsx`:

```tsx
import { SignOut, Target } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'

export type OfficerSection = 'dashboard' | 'courses'

interface OfficerTopBarProps {
  activeSection: OfficerSection
  onSelectSection: (section: OfficerSection) => void
}

const officerSections: { id: OfficerSection; label: string }[] = [
  { id: 'dashboard', label: 'My Dashboard' },
  { id: 'courses', label: 'My Courses' },
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

- [ ] **Step 2: Implement `OfficerApp.tsx`**

Create `src/pages/OfficerApp.tsx`:

```tsx
import { useState } from 'react'
import { OfficerCourses } from '../components/officer/OfficerCourses'
import { OfficerDashboard } from '../components/officer/OfficerDashboard'
import { OfficerTopBar, type OfficerSection } from '../components/officer/OfficerTopBar'

export function OfficerApp() {
  const [section, setSection] = useState<OfficerSection>('dashboard')

  return (
    <div className="min-h-screen bg-bg">
      <OfficerTopBar activeSection={section} onSelectSection={setSection} />
      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {section === 'dashboard' && <OfficerDashboard />}
        {section === 'courses' && <OfficerCourses />}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Wire routing in `App.tsx` and retarget `LandingPage`'s CTAs**

Replace the full contents of `src/App.tsx` with:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireRole } from './components/shared/RequireRole'
import { DiagnosticsApp } from './pages/DiagnosticsApp'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { OfficerApp } from './pages/OfficerApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <RequireRole role="admin">
              <DiagnosticsApp />
            </RequireRole>
          }
        />
        <Route
          path="/officer"
          element={
            <RequireRole role="officer">
              <OfficerApp />
            </RequireRole>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

In `src/pages/LandingPage.tsx`, change all three occurrences of `to="/app"` (lines 84, 156,
and 406 as of this plan being written — search for the literal string if line numbers have
since shifted) to `to="/login"`. Make no other change to this file.

- [ ] **Step 4: Manual verification (first end-to-end checkpoint)**

Run: `npm run dev`, open the printed local URL.

1. On the landing page, click any primary CTA button ("Get started" / "Try the demo" / whichever text is present) — confirm it now lands on `/login`, not `/app`.
2. On `/login`, click "Continue as Officer" — confirm you land on `/officer`, see "Welcome back, Rohit" with 4 stat cards, a bar chart, and a Competency Domains panel showing "Digital Governance" as either a real score or "(partial)" and "Insufficient data" appearing nowhere it shouldn't (only Governance should show partial; no domain should show a bare "Insufficient data" block for this officer at the domain level, since only one competency, not a whole domain, is unassessed).
3. Click "My Courses" — confirm 3 courses render, each naming a real competency label and a score.
4. Click "Switch role" — confirm you land back on `/login`.
5. Click "Continue as Coordinator (Admin)" — confirm you land on `/app` and see the existing (not yet restyled) DiagnosticsApp shell.
6. Manually navigate the browser to `/app` directly (paste URL) after first clearing session storage (DevTools → Application → Session Storage → delete `sih26.role`) — confirm you're redirected to `/login` (the guard works).

- [ ] **Step 5: Commit**

```bash
git add src/components/officer/OfficerTopBar.tsx src/pages/OfficerApp.tsx src/App.tsx src/pages/LandingPage.tsx
git commit -m "feat: wire role-based routing and the officer app shell"
```

---

## Task 12: `AdminCohortOverview`

**Files:**
- Create: `src/components/admin/AdminCohortOverview.tsx`

**Interfaces:**
- Consumes: `domains`, `getOfficerDomainScore`, `CURRENT_CYCLE_ID` from `../../data/competencyDomains` (Task 3); `departments`, `getDepartmentAssessedFraction`, `getDepartmentAvgScore`, `getDepartmentOfficers`, `getDepartmentStatus`, `type DepartmentStatus` from `../../data/departments` (Task 4); `HeatSparkline` from `../shared/HeatSparkline` (Task 6).
- Produces: `AdminCohortOverview()`. Consumed by Task 14 (`DiagnosticsApp` wiring, replaces `OverviewScreen`).

The per-department heat-sparkline cells (one per domain) are computed locally in this file
by averaging `getOfficerDomainScore` across that department's officers — this aggregation
is used by exactly one consumer, so it stays a local helper rather than a new exported
function in `departments.ts` (see Global Constraints: no speculative abstraction).

- [ ] **Step 1: Implement `AdminCohortOverview.tsx`**

Create `src/components/admin/AdminCohortOverview.tsx`:

```tsx
import { CalendarBlank, UsersThree } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, domains, getOfficerDomainScore } from '../../data/competencyDomains'
import {
  type DepartmentStatus,
  departments,
  getDepartmentAssessedFraction,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from '../../data/departments'
import { HeatSparkline } from '../shared/HeatSparkline'

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

function departmentDomainCells(departmentId: string) {
  const deptOfficers = getDepartmentOfficers(departmentId)
  return domains.map((domain) => {
    const scores = deptOfficers
      .map((officer) => getOfficerDomainScore(officer.id, domain.id, CURRENT_CYCLE_ID).score)
      .filter((score): score is number => score !== null)
    const score = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null
    return { id: domain.id, label: domain.name, score }
  })
}

export function AdminCohortOverview() {
  return (
    <div>
      <p className="text-caption text-text-muted">{departments.length} departments</p>

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => {
          const status = getDepartmentStatus(department.id)
          const avgScore = getDepartmentAvgScore(department.id)
          const { assessed, total } = getDepartmentAssessedFraction(department.id)

          return (
            <div key={department.id} className="card-lift rounded-sm border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-caption text-text-muted">{department.code}</p>
                  <h2 className="mt-0.5 text-h1 font-semibold text-text-primary">{department.name}</h2>
                </div>
                <span className={`shrink-0 rounded-sm px-2 py-0.5 text-micro font-medium ${statusClass[status]}`}>
                  {statusLabel[status]}
                </span>
              </div>

              <div className="mt-4">
                <HeatSparkline cells={departmentDomainCells(department.id)} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-caption">
                  <span className="text-text-secondary">Avg competency</span>
                  <span className="font-medium tabular-nums text-text-primary">{avgScore}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
                  <div className="h-full bg-primary" style={{ width: `${avgScore}%` }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-caption">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <UsersThree size={14} />
                  Officers assessed
                </span>
                <span className="font-medium tabular-nums text-text-primary">
                  {assessed}/{total}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-caption">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <CalendarBlank size={14} />
                  Next review
                </span>
                <span className="font-medium text-text-primary">
                  {new Date(department.nextReviewDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminCohortOverview.tsx
git commit -m "feat: add AdminCohortOverview"
```

---

## Task 13: `RejectionAuditBoard`

**Files:**
- Create: `src/components/admin/RejectionAuditBoard.tsx`

**Interfaces:**
- Consumes: `type AuditStatus`, `type RejectionReason`, `type VerificationPass`, `filterAuditItems`, `mockRejectionAuditItems`, `rejectionReasonLabels`, `sourceDocuments`, `verificationPassLabels` from `../../data/rejectionAudit` (Task 5).
- Produces: `RejectionAuditBoard()`. Consumed by Task 14 (`DiagnosticsApp` wiring).

- [ ] **Step 1: Implement `RejectionAuditBoard.tsx`**

Create `src/components/admin/RejectionAuditBoard.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { ListChecks, Robot, ShieldWarning, SlidersHorizontal } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import {
  type AuditStatus,
  type RejectionReason,
  type VerificationPass,
  filterAuditItems,
  mockRejectionAuditItems,
  rejectionReasonLabels,
  sourceDocuments,
  verificationPassLabels,
} from '../../data/rejectionAudit'

const columns: { id: AuditStatus; label: string }[] = [
  { id: 'rejected', label: 'Rejected' },
  { id: 'needs_manual_review', label: 'Needs Manual Review' },
  { id: 'verified', label: 'Verified' },
  { id: 'flagged', label: 'Flagged' },
]

const reasonTagClass: Record<Exclude<RejectionReason, null>, string> = {
  failed_span_match: 'bg-primary-tint text-primary',
  failed_semantic_support: 'bg-accent-tint text-accent',
  low_confidence: 'border border-border-strong text-text-secondary',
}

// Icons, not human avatars: these mark which automated pipeline stage caught the issue,
// and a fake human avatar would misrepresent an automated step (spec §6).
const passIcon: Record<VerificationPass, Icon> = {
  first_pass_llm: Robot,
  deterministic_check: ListChecks,
  second_pass_adversarial: ShieldWarning,
}

export function RejectionAuditBoard() {
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [reasonFilter, setReasonFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: sourceFilter === 'all' ? undefined : sourceFilter,
      rejectionReason: reasonFilter === 'all' ? undefined : (reasonFilter as RejectionReason),
    })
  }, [sourceFilter, reasonFilter])

  const hasActiveFilters = sourceFilter !== 'all' || reasonFilter !== 'all'
  const reasonKeys = Object.keys(rejectionReasonLabels) as Exclude<RejectionReason, null>[]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-caption text-text-secondary">
          <SlidersHorizontal size={14} />
          Filter
        </span>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All source documents</option>
          {sourceDocuments.map((doc) => (
            <option key={doc} value={doc}>
              {doc}
            </option>
          ))}
        </select>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All rejection reasons</option>
          {reasonKeys.map((reason) => (
            <option key={reason} value={reason}>
              {rejectionReasonLabels[reason]}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSourceFilter('all')
              setReasonFilter('all')
            }}
            className="text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset filters
          </button>
        )}
        <span className="text-caption text-text-muted">
          {filtered.length} of {mockRejectionAuditItems.length} items
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((column) => {
          const items = filtered.filter((item) => item.status === column.id)
          return (
            <div key={column.id} className="rounded-sm border border-border bg-surface-alt p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <p className="text-h3 font-semibold text-text-primary">{column.label}</p>
                <span className="text-micro text-text-muted">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const PassIcon = passIcon[item.verificationPass]
                  return (
                    <div key={item.id} className="rounded-sm border border-border bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-micro font-medium text-text-muted">{item.questionId}</span>
                        <span title={verificationPassLabels[item.verificationPass]}>
                          <PassIcon size={14} className="text-text-muted" />
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-caption text-text-primary">{item.questionText}</p>
                      <p className="mt-1.5 text-micro text-text-muted">{item.sourceDocument}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.rejectionReason && (
                          <span
                            className={`rounded-sm px-1.5 py-0.5 text-micro font-medium ${reasonTagClass[item.rejectionReason]}`}
                          >
                            {rejectionReasonLabels[item.rejectionReason]}
                          </span>
                        )}
                        <span className="text-micro text-text-muted">
                          {new Date(item.reviewedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-center text-caption text-text-muted">
                    No items match the current filters.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/RejectionAuditBoard.tsx
git commit -m "feat: add RejectionAuditBoard with source-document and reason filters"
```

---

## Task 14: Admin nav rebuild + full `DiagnosticsApp` wiring (second end-to-end checkpoint)

**Files:**
- Modify: `src/mockData.ts` (replace `NavItem`/`navItems`; update `sectionCopy`/`breadcrumbBySection`)
- Modify: `src/components/layout/LeftNav.tsx` (full rewrite)
- Modify: `src/components/layout/AppShell.tsx` (add `activeChildId` passthrough)
- Modify: `src/pages/DiagnosticsApp.tsx` (full rewrite)
- Delete: `src/components/screens/OverviewScreen.tsx`

**Interfaces:**
- Consumes: `AdminCohortOverview` (Task 12), `RejectionAuditBoard` (Task 13), all existing screen components (unchanged).
- Produces: `interface NavChildItem { id: string; label: string }`, `interface NavItem { id: string; label: string; children?: NavChildItem[] }`, `interface NavGroup { id: string; label: string; items: NavItem[] }`, `navGroups: NavGroup[]` from `mockData.ts` — this **replaces** the old flat `navItems`/`NavItem` export (confirmed by grep: `LeftNav.tsx` is the only consumer of the old export). `LeftNav`'s `onSelect` prop signature becomes `(id: string, childId?: string) => void`.

- [ ] **Step 1: Replace the nav data in `mockData.ts`**

In `src/mockData.ts`, replace this block (near the top of the file):

```ts
export interface NavItem {
  id: string
  label: string
}

export const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'officers', label: 'Officers' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]
```

with:

```ts
export interface NavChildItem {
  id: string
  label: string
}

export interface NavItem {
  id: string
  label: string
  children?: NavChildItem[]
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: 'diagnostics-group',
    label: 'Diagnostics',
    items: [
      { id: 'overview', label: 'Dashboard' },
      {
        id: 'diagnostics',
        label: 'New Assessment',
        children: [
          { id: 'upload', label: 'Upload Material' },
          { id: 'generate', label: 'Generate Questions' },
          { id: 'quiz', label: 'Assessment' },
          { id: 'dashboard', label: 'Competency Report' },
          { id: 'recommendations', label: 'Recommendations' },
        ],
      },
      { id: 'officers', label: 'Officers' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  {
    id: 'governance-group',
    label: 'Quality & Governance',
    items: [
      { id: 'audit', label: 'Verification Audit' },
      { id: 'settings', label: 'Settings' },
    ],
  },
]
```

Then replace this block (further down the file, `sectionCopy` and `breadcrumbBySection`):

```ts
export const sectionCopy: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Start a new AI competency assessment for an NSSTA training cohort.',
  },
  officers: {
    title: 'Officers',
    subtitle: 'Officers in the current cohort and their overall competency score.',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Competency reports generated for this cohort.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Your NSSTA account details.',
  },
}

export const breadcrumbBySection: Record<string, string[]> = {
  overview: ['Overview'],
  officers: ['Officers'],
  reports: ['Reports'],
  settings: ['Settings'],
}
```

with:

```ts
export const sectionCopy: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard',
    subtitle: 'Department-level competency progress across the organisation.',
  },
  officers: {
    title: 'Officers',
    subtitle: 'Officers in the current cohort and their overall competency score.',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Competency reports generated for this cohort.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Your NSSTA account details.',
  },
  audit: {
    title: 'Verification Audit',
    subtitle:
      'Question-generation verification outcomes for this cohort, reviewable by source document and rejection reason.',
  },
}

export const breadcrumbBySection: Record<string, string[]> = {
  overview: ['Dashboard'],
  officers: ['Officers'],
  reports: ['Reports'],
  settings: ['Settings'],
  audit: ['Verification Audit'],
}
```

- [ ] **Step 2: Rewrite `LeftNav.tsx`**

Replace the full contents of `src/components/layout/LeftNav.tsx` with:

```tsx
import { useState } from 'react'
import {
  CaretDown,
  CaretLineLeft,
  CaretLineRight,
  ChartBar,
  ClipboardText,
  CloudArrowUp,
  FileText,
  GearSix,
  GraduationCap,
  MagnifyingGlass,
  Sparkle,
  SquaresFour,
  Target,
  UsersThree,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { navGroups } from '../../mockData'

const iconByItemId: Record<string, Icon> = {
  overview: SquaresFour,
  diagnostics: Target,
  upload: CloudArrowUp,
  generate: Sparkle,
  quiz: ClipboardText,
  dashboard: ChartBar,
  recommendations: GraduationCap,
  officers: UsersThree,
  reports: FileText,
  audit: MagnifyingGlass,
  settings: GearSix,
}

interface LeftNavProps {
  activeId: string
  activeChildId?: string
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelect: (id: string, childId?: string) => void
}

export function LeftNav({ activeId, activeChildId, collapsed, onToggleCollapsed, onSelect }: LeftNavProps) {
  const [expandedId, setExpandedId] = useState<string | null>('diagnostics')

  return (
    <nav
      className="flex h-full shrink-0 flex-col overflow-y-auto border-r border-border bg-surface transition-[width] duration-150"
      style={{ width: collapsed ? 64 : 256 }}
      aria-label="Primary"
    >
      <div className="flex-1 py-4" style={{ paddingInline: collapsed ? 8 : 12 }}>
        {navGroups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-micro font-semibold uppercase tracking-wide text-text-muted">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const ItemIcon = iconByItemId[item.id]
                const hasChildren = !!item.children?.length
                const isExpanded = expandedId === item.id
                const isActive = item.id === activeId && !hasChildren
                const isParentActive = hasChildren && item.id === activeId

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (hasChildren) {
                          const nowExpanding = !isExpanded
                          setExpandedId(nowExpanding ? item.id : null)
                          if (nowExpanding) onSelect(item.id, item.children![0].id)
                        } else {
                          onSelect(item.id)
                        }
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-body transition-colors ${
                        isActive || isParentActive
                          ? 'bg-primary-tint text-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                      }`}
                    >
                      <ItemIcon
                        size={18}
                        weight={isActive || isParentActive ? 'fill' : 'regular'}
                        className="shrink-0"
                      />
                      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                      {!collapsed && hasChildren && (
                        <CaretDown
                          size={12}
                          className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {!collapsed && hasChildren && isExpanded && (
                      <ul className="mt-1 space-y-0.5 border-l border-border pl-4">
                        {item.children!.map((child) => {
                          const ChildIcon = iconByItemId[child.id]
                          const isChildActive = item.id === activeId && child.id === activeChildId
                          return (
                            <li key={child.id}>
                              <button
                                type="button"
                                onClick={() => onSelect(item.id, child.id)}
                                className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-1.5 text-caption transition-colors ${
                                  isChildActive
                                    ? 'bg-primary-tint text-primary font-medium'
                                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                }`}
                              >
                                <ChildIcon
                                  size={14}
                                  weight={isChildActive ? 'fill' : 'regular'}
                                  className="shrink-0"
                                />
                                <span className="truncate">{child.label}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="flex w-full items-center justify-center gap-2 rounded-sm px-3 py-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary"
        >
          {collapsed ? <CaretLineRight size={18} /> : <CaretLineLeft size={18} />}
          {!collapsed && <span className="text-caption">Collapse</span>}
        </button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Pass `activeChildId` through `AppShell.tsx`**

In `src/components/layout/AppShell.tsx`, update the props interface and the `<LeftNav>` call:

```tsx
interface AppShellProps {
  breadcrumb: string[]
  activeNavId: string
  activeChildId?: string
  onNavSelect: (id: string, childId?: string) => void
  children: ReactNode
}

export function AppShell({ breadcrumb, activeNavId, activeChildId, onNavSelect, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <TopBar breadcrumb={breadcrumb} />
      <div className="flex min-h-0 flex-1">
        <LeftNav
          activeId={activeNavId}
          activeChildId={activeChildId}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onSelect={onNavSelect}
        />
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg">
          <div className="mx-auto max-w-[1440px] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
```

(Only the interface and the function signature/`<LeftNav>` props change — the rest of the file is unchanged.)

- [ ] **Step 4: Rewrite `DiagnosticsApp.tsx`**

Replace the full contents of `src/pages/DiagnosticsApp.tsx` with:

```tsx
import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { AdminCohortOverview } from '../components/admin/AdminCohortOverview'
import { RejectionAuditBoard } from '../components/admin/RejectionAuditBoard'
import { DashboardScreen } from '../components/screens/DashboardScreen'
import { GenerateScreen } from '../components/screens/GenerateScreen'
import { OfficersScreen } from '../components/screens/OfficersScreen'
import { QuizScreen } from '../components/screens/QuizScreen'
import { RecommendationsScreen } from '../components/screens/RecommendationsScreen'
import { ReportsScreen } from '../components/screens/ReportsScreen'
import { SettingsScreen } from '../components/screens/SettingsScreen'
import { UploadScreen } from '../components/screens/UploadScreen'
import {
  breadcrumbByStep,
  breadcrumbBySection,
  sectionCopy,
  stepCopy,
  type Step,
} from '../mockData'

type Section = 'overview' | 'diagnostics' | 'officers' | 'reports' | 'settings' | 'audit'

export function DiagnosticsApp() {
  const [section, setSection] = useState<Section>('overview')
  const [step, setStep] = useState<Step>('upload')

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
        {section === 'overview' && <AdminCohortOverview />}
        {section === 'officers' && <OfficersScreen />}
        {section === 'reports' && (
          <ReportsScreen onViewReport={() => goToDiagnostics('dashboard')} />
        )}
        {section === 'settings' && <SettingsScreen />}
        {section === 'audit' && <RejectionAuditBoard />}

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

- [ ] **Step 5: Delete the superseded `OverviewScreen`**

Run: `git rm src/components/screens/OverviewScreen.tsx`

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors (this also confirms nothing else still imports `OverviewScreen` or the old
`navItems`/`NavItem` exports).

- [ ] **Step 7: Manual verification (second end-to-end checkpoint)**

Run: `npm run dev`, log in as Coordinator (Admin).

1. Confirm the sidebar shows two group headers ("Diagnostics", "Quality & Governance") with the
   items listed in Step 1's `navGroups`.
2. Click "Dashboard" — confirm it shows `AdminCohortOverview`'s department card grid (6 cards,
   status badges, heat-sparklines, progress bars, officers-assessed fractions, review dates).
3. Click "New Assessment" — confirm it expands to 5 sub-items and navigates to "Upload Material".
   Click through all 5 sub-items and confirm each renders the correct existing screen and that
   the correct sub-item is highlighted as active.
4. Click "Officers" and "Reports" — confirm they still work exactly as before.
5. Click "Verification Audit" — confirm the 4-column Kanban board renders with 18 cards total
   across the columns, and that both filter dropdowns actually narrow the visible cards (test at
   least one combination of both filters together, and confirm "Reset filters" restores all 18).
6. Click "Settings" — confirm it still works exactly as before.
7. Collapse and expand the sidebar (bottom button) — confirm both group headers and the grouped
   items still behave sensibly collapsed (icons only).

- [ ] **Step 8: Commit**

```bash
git add src/mockData.ts src/components/layout/LeftNav.tsx src/components/layout/AppShell.tsx src/pages/DiagnosticsApp.tsx
git rm src/components/screens/OverviewScreen.tsx
git commit -m "feat: rebuild the admin sidebar with grouped nav and wire in the new pages"
```

---

## Task 15: `TopBar` enrichment (search, notifications, switch-role)

**Files:**
- Modify: `src/components/layout/TopBar.tsx` (full rewrite)

**Interfaces:**
- Consumes: `clearRole` from `../../lib/session` (Task 1); `org`, `session` from `../../mockData` (existing, unchanged).
- Produces: same `TopBar(props: { breadcrumb: string[] })` signature as before — no consumers need to change.

No dark/light theme toggle is added here (Global Constraints: the palette is locked to one register by design) — only a search affordance, a notification bell, and a working "Switch role" control are added, matching the reference's top-bar density without copying every element.

- [ ] **Step 1: Rewrite `TopBar.tsx`**

Replace the full contents of `src/components/layout/TopBar.tsx` with:

```tsx
import { Bell, CaretRight, MagnifyingGlass, SignOut, Target } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
import { org, session } from '../../mockData'

interface TopBarProps {
  breadcrumb: string[]
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TopBar({ breadcrumb }: TopBarProps) {
  const navigate = useNavigate()

  function switchRole() {
    clearRole()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-primary-hover bg-primary px-4 text-white">
      <div className="flex min-w-0 items-center gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-white">
          <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
            <Target size={18} weight="bold" />
          </span>
          <div className="leading-tight">
            <div className="text-h2 font-semibold">MoSPI · NSSTA</div>
            <div className="text-micro text-white/65">{org.productName}</div>
          </div>
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-1.5 text-caption text-white/75 md:flex"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <CaretRight size={12} className="text-white/40" />}
              <span className={i === breadcrumb.length - 1 ? 'text-white' : undefined}>{crumb}</span>
            </span>
          ))}
        </nav>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-caption text-white/70">
          <MagnifyingGlass size={14} />
          <span className="truncate">Search officers, reports, questions…</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent" />
        </button>

        <button
          type="button"
          onClick={switchRole}
          className="hidden items-center gap-1.5 rounded-sm border border-white/25 px-3 py-1.5 text-caption font-medium transition-colors hover:bg-white/10 sm:flex"
        >
          <SignOut size={14} />
          Switch role
        </button>

        <div className="hidden text-right leading-tight sm:block">
          <div className="text-body font-medium">{session.name}</div>
          <div className="text-micro text-white/65">{session.role}</div>
        </div>
        <span className="flex size-8 items-center justify-center rounded-sm bg-white/15 text-caption font-semibold">
          {initials(session.name)}
        </span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in as Coordinator (Admin).

1. Confirm the top bar now shows a search affordance (center, on wide viewports) and a
   notification bell with a small accent-colored dot.
2. Click "Switch role" — confirm it clears the session and returns to `/login`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat: enrich the admin top bar with search, notifications, and switch-role"
```

---

## Task 16: Restyle — Upload / Generate / Quiz (diagnostics flow, visual only)

**Files:**
- Modify: `src/components/screens/UploadScreen.tsx` (full rewrite)
- Modify: `src/components/screens/GenerateScreen.tsx` (full rewrite)
- Modify: `src/components/screens/QuizScreen.tsx` (full rewrite)

**Interfaces:** unchanged — `UploadScreen(props: { onComplete: () => void })`, `GenerateScreen(props: { onComplete: () => void })`, `QuizScreen(props: { onComplete: () => void })` keep their exact existing signatures; `DiagnosticsApp.tsx` (Task 14) needs no changes.

Every state transition, timer, and piece of copy in these three screens stays identical —
only visual chrome changes (`card-lift`, icons, minor density additions). Per Global
Constraints, `GenerateScreen`'s live counters do **not** get a fabricated comparison value.

- [ ] **Step 1: Rewrite `UploadScreen.tsx`**

Replace the full contents of `src/components/screens/UploadScreen.tsx` with:

```tsx
import { useEffect, useRef, useState } from 'react'
import { CheckCircle, CloudArrowUp, FilePdf } from '@phosphor-icons/react'
import { mockUpload } from '../../mockData'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'done'

interface UploadScreenProps {
  onComplete: () => void
}

export function UploadScreen({ onComplete }: UploadScreenProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state !== 'uploading') return

    const stepMs = 40
    const increment = 100 / (mockUpload.uploadDurationMs / stepMs)
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(id)
          setState('done')
          return 100
        }
        return next
      })
    }, stepMs)

    return () => clearInterval(id)
  }, [state])

  function beginUpload() {
    setProgress(0)
    setState('uploading')
  }

  if (state === 'uploading' || state === 'done') {
    return (
      <div className="max-w-xl">
        <p className="mb-2 text-caption font-medium uppercase tracking-wide text-text-muted">
          Reference material
        </p>
        <div className="card-lift rounded-sm border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-primary">
              <FilePdf size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-text-primary">
                {mockUpload.fileName}
              </p>
              <p className="text-caption text-text-muted">
                {mockUpload.fileSize} · {state === 'done' ? 'Uploaded' : `${Math.round(progress)}%`}
              </p>
            </div>
            {state === 'done' && (
              <CheckCircle size={22} weight="fill" className="shrink-0 text-strong" />
            )}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-sm bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {state === 'done' && (
            <button
              type="button"
              onClick={onComplete}
              className="mt-5 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Generate questions
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <p className="mb-2 text-caption font-medium uppercase tracking-wide text-text-muted">
        Reference material
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setState('dragging')
        }}
        onDragLeave={() => setState('idle')}
        onDrop={(e) => {
          e.preventDefault()
          beginUpload()
        }}
        className={`flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed transition-colors ${
          state === 'dragging'
            ? 'border-primary bg-primary-tint'
            : 'border-border-strong bg-surface hover:bg-surface-alt'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) beginUpload()
          }}
        />
        <CloudArrowUp
          size={32}
          weight="light"
          className={state === 'dragging' ? 'text-primary' : 'text-text-muted'}
        />
        <div className="text-center">
          <p className="text-body font-medium text-text-primary">
            Drag and drop a file, or click to browse
          </p>
          <p className="mt-1 text-caption text-text-muted">PDF, DOCX or TXT up to 25 MB</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `GenerateScreen.tsx`**

Replace the full contents of `src/components/screens/GenerateScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react'
import { CaretDown, CaretUp, CheckCircle, Sparkle, WarningCircle } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { mockGeneration } from '../../mockData'

type GenState = 'running' | 'done'
type Tone = 'neutral' | 'strong' | 'weak'

interface GenerateScreenProps {
  onComplete: () => void
}

function StatTile({
  label,
  value,
  tone,
  icon: ItemIcon,
}: {
  label: string
  value: number
  tone: Tone
  icon: Icon
}) {
  const toneClass =
    tone === 'strong' ? 'text-strong' : tone === 'weak' ? 'text-weak' : 'text-text-primary'
  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption text-text-secondary">{label}</p>
        <ItemIcon size={16} className={toneClass} />
      </div>
      <p className={`mt-2 text-metric font-medium tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}

export function GenerateScreen({ onComplete }: GenerateScreenProps) {
  const [state, setState] = useState<GenState>('running')
  const [counts, setCounts] = useState({ generated: 0, verified: 0, rejected: 0 })
  const [showRejected, setShowRejected] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const fraction = Math.min((Date.now() - start) / mockGeneration.durationMs, 1)
      setCounts({
        generated: Math.round(mockGeneration.generated * fraction),
        verified: Math.round(mockGeneration.verified * fraction),
        rejected: Math.round(mockGeneration.rejected * fraction),
      })
      if (fraction >= 1) {
        clearInterval(id)
        setState('done')
      }
    }, 60)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Generated" value={counts.generated} tone="neutral" icon={Sparkle} />
        <StatTile label="Verified" value={counts.verified} tone="strong" icon={CheckCircle} />
        <StatTile label="Rejected" value={counts.rejected} tone="weak" icon={WarningCircle} />
      </div>

      {state === 'running' && (
        <p className="mt-4 text-caption text-text-muted">
          Drafting and verifying questions against the source material.
        </p>
      )}

      {state === 'done' && (
        <>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowRejected((v) => !v)}
              className="flex items-center gap-1.5 text-body font-medium text-primary hover:text-primary-hover"
            >
              {showRejected ? <CaretUp size={16} /> : <CaretDown size={16} />}
              View rejected
            </button>

            {showRejected && (
              <div className="mt-3 space-y-2">
                {mockGeneration.rejectedSample.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-sm bg-weak-tint px-3 py-2"
                  >
                    <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-weak" />
                    <p className="text-caption text-weak">{item.reason}</p>
                  </div>
                ))}
                <p className="text-caption text-text-muted">
                  Showing {mockGeneration.rejectedSample.length} of {mockGeneration.rejected}{' '}
                  rejected items.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="mt-6 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Continue to assessment
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `QuizScreen.tsx`**

Replace the full contents of `src/components/screens/QuizScreen.tsx` with:

```tsx
import { useState } from 'react'
import { CaretDown, CaretUp, CheckCircle, XCircle } from '@phosphor-icons/react'
import { mockQuiz, type QuizQuestion } from '../../mockData'

interface QuizScreenProps {
  onComplete: () => void
}

interface QuestionCardProps {
  question: QuizQuestion
  selected: string | undefined
  onSelect: (optionId: string) => void
  onNext: () => void
  isLast: boolean
}

function QuestionCard({ question, selected, onSelect, onNext, isLast }: QuestionCardProps) {
  const [sourceOpen, setSourceOpen] = useState(false)

  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-6">
      <p className="text-caption text-text-secondary">{question.topic}</p>
      <h2 className="mt-1 text-h2 font-semibold text-text-primary">{question.prompt}</h2>

      <div className="mt-4 space-y-2">
        {question.options.map((option) => {
          const isCorrect = option.id === question.correctOptionId
          const isSelected = option.id === selected

          let containerClasses = 'border-border bg-surface hover:bg-surface-alt text-text-primary'
          let badge: { label: string; toneClass: string } | null = null

          if (selected) {
            if (isCorrect) {
              containerClasses = 'border-strong bg-strong-tint text-text-primary'
              badge = { label: isSelected ? 'Correct' : 'Correct answer', toneClass: 'text-strong' }
            } else if (isSelected) {
              containerClasses = 'border-weak bg-weak-tint text-text-primary'
              badge = { label: 'Incorrect', toneClass: 'text-weak' }
            } else {
              containerClasses = 'border-border bg-surface text-text-muted'
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={!!selected}
              onClick={() => onSelect(option.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left text-body tabular-nums transition-colors ${containerClasses} ${
                selected ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span>{option.text}</span>
              {badge && (
                <span className={`flex shrink-0 items-center gap-1 text-caption font-medium ${badge.toneClass}`}>
                  {badge.toneClass === 'text-strong' ? (
                    <CheckCircle size={15} weight="fill" />
                  ) : (
                    <XCircle size={15} weight="fill" />
                  )}
                  {badge.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setSourceOpen((v) => !v)}
          className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
        >
          {sourceOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
          {question.source.citation}
        </button>

        {sourceOpen && (
          <div className="mt-2 rounded-sm border border-border bg-surface-alt px-4 py-3">
            <p className="text-caption text-text-secondary">{question.source.snippet}</p>
          </div>
        )}
      </div>

      {selected && (
        <button
          type="button"
          onClick={onNext}
          className="mt-5 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {isLast ? 'View competency report' : 'Next question'}
        </button>
      )}
    </div>
  )
}

export function QuizScreen({ onComplete }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const question = mockQuiz[currentIndex]
  const isLast = currentIndex === mockQuiz.length - 1
  const answeredCount = Object.keys(answers).length
  const percentComplete = Math.round((answeredCount / mockQuiz.length) * 100)

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-caption text-text-muted">
          <span>
            Question {currentIndex + 1} of {mockQuiz.length}
          </span>
          <span className="tabular-nums">{percentComplete}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-sm bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        selected={answers[question.id]}
        onSelect={(optionId) => setAnswers((prev) => ({ ...prev, [question.id]: optionId }))}
        onNext={() => {
          if (isLast) {
            onComplete()
          } else {
            setCurrentIndex((i) => i + 1)
          }
        }}
        isLast={isLast}
      />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from these 3 files.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, log in as Coordinator (Admin), go to New Assessment.

1. Upload Material: confirm the dropzone and the uploaded-file card render with the new
   eyebrow label and card-lift hover, and the upload still auto-completes and lets you
   continue.
2. Generate Questions: confirm the 3 stat tiles now each show an icon, counts still animate
   up to the same final values, and "View rejected" still works.
3. Assessment: confirm each question card lifts on hover, the progress bar now also shows a
   "% complete" label, and answering/advancing through all 4 questions still works exactly
   as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/screens/UploadScreen.tsx src/components/screens/GenerateScreen.tsx src/components/screens/QuizScreen.tsx
git commit -m "refactor: restyle Upload/Generate/Quiz screens into the denser visual language"
```

---

## Task 17: Restyle — Dashboard (heatmap) / Officers / Reports / Recommendations (visual only)

**Files:**
- Modify: `src/components/screens/DashboardScreen.tsx` (full rewrite)
- Modify: `src/components/screens/OfficersScreen.tsx` (full rewrite)
- Modify: `src/components/screens/ReportsScreen.tsx` (full rewrite)
- Modify: `src/components/screens/RecommendationsScreen.tsx` (full rewrite)

**Interfaces:** unchanged — all 4 components keep their exact existing props signatures;
`DiagnosticsApp.tsx` (Task 14) needs no changes.

Design rule applied consistently across these 4 files (and already used in Task 16):
`card-lift` (transform + shadow) is for standalone bordered cards; a plain
`hover:bg-surface-alt` background change is for rows inside a shared divided/table
container, since lifting one row out of a flush table looks broken. Table/column headers
gain `uppercase tracking-wide` for the denser admin-kit header treatment. All sort,
expand, and filter logic is byte-for-byte identical to today.

- [ ] **Step 1: Rewrite `DashboardScreen.tsx`**

Replace the full contents of `src/components/screens/DashboardScreen.tsx` with:

```tsx
import { Fragment, useMemo, useState } from 'react'
import { CaretRight, CaretUp } from '@phosphor-icons/react'
import {
  competencyDimensions,
  getOfficerAverage,
  getOfficersAtLevel,
  getStrongestDimension,
  getWeakestDimension,
  mockCompetencyMatrix,
  type CompetencyLevel,
  type OfficerRow,
} from '../../mockData'

interface DashboardScreenProps {
  onComplete: () => void
}

const levelLabel: Record<CompetencyLevel, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  insufficient: 'Insufficient data',
}

const levelCellClasses: Record<CompetencyLevel, string> = {
  strong: 'border-strong/25 bg-strong-tint text-strong',
  moderate: 'border-moderate/25 bg-moderate-tint text-moderate',
  weak: 'border-weak/25 bg-weak-tint text-weak',
  insufficient: 'border-dashed border-insufficient bg-surface',
}

function officerExtremes(officer: OfficerRow) {
  const scored = competencyDimensions
    .map((dimension) => ({ dimension, cell: officer.cells[dimension.id] }))
    .filter(
      (entry): entry is { dimension: (typeof competencyDimensions)[number]; cell: { score: number; level: CompetencyLevel } } =>
        entry.cell.score !== null,
    )
  const weakest = scored.reduce((min, entry) => (entry.cell.score < min.cell.score ? entry : min), scored[0])
  const strongest = scored.reduce((max, entry) => (entry.cell.score > max.cell.score ? entry : max), scored[0])
  return { weakest, strongest }
}

export function DashboardScreen({ onComplete }: DashboardScreenProps) {
  const [sortKey, setSortKey] = useState<string>('overall')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allCells = mockCompetencyMatrix.flatMap((officer) =>
    competencyDimensions.map((dim) => officer.cells[dim.id]),
  )
  const validScores = allCells
    .map((cell) => cell.score)
    .filter((score): score is number => score !== null)
  const averageScore = Math.round(
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length,
  )
  const insufficientCount = allCells.filter((cell) => cell.level === 'insufficient').length
  const weakest = getWeakestDimension()
  const strongest = getStrongestDimension()
  const needsSupportCount =
    getOfficersAtLevel(weakest.id, 'weak').length + getOfficersAtLevel(weakest.id, 'moderate').length

  const sortedOfficers = useMemo(() => {
    const rows = [...mockCompetencyMatrix]
    if (sortKey === 'overall') {
      rows.sort((a, b) => getOfficerAverage(a) - getOfficerAverage(b))
    } else {
      rows.sort((a, b) => {
        const scoreA = a.cells[sortKey].score ?? Infinity
        const scoreB = b.cells[sortKey].score ?? Infinity
        return scoreA - scoreB
      })
    }
    return rows
  }, [sortKey])

  const activeDimensionLabel = competencyDimensions.find((d) => d.id === sortKey)?.label

  return (
    <div>
      <p className="max-w-[68ch] text-h1 font-semibold leading-snug text-text-primary">
        This cohort is strongest in{' '}
        <span className="text-strong">{strongest.label.toLowerCase()}</span> and weakest in{' '}
        <span className="text-weak">{weakest.label.toLowerCase()}</span>, where{' '}
        <span className="tabular-nums">
          {needsSupportCount} of {mockCompetencyMatrix.length}
        </span>{' '}
        officers need support.
      </p>

      <p className="mt-2 text-caption text-text-secondary">
        {mockCompetencyMatrix.length} officers assessed · {averageScore}% cohort average ·{' '}
        {insufficientCount} cell{insufficientCount === 1 ? '' : 's'} with insufficient data
      </p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-caption text-text-muted">
          Sorted by {sortKey === 'overall' ? 'overall score' : activeDimensionLabel}, weakest
          officer first. Click a column to sort by that dimension instead.
        </p>
        {sortKey !== 'overall' && (
          <button
            type="button"
            onClick={() => setSortKey('overall')}
            className="shrink-0 text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset sort
          </button>
        )}
      </div>

      <div className="mt-2 overflow-x-auto rounded-sm border border-border">
        <div
          className="grid min-w-[880px]"
          style={{ gridTemplateColumns: `220px repeat(${competencyDimensions.length}, 1fr)` }}
        >
          <div className="border-b border-border bg-surface-alt px-4 py-3" />
          {competencyDimensions.map((dimension) => {
            const active = sortKey === dimension.id
            return (
              <button
                key={dimension.id}
                type="button"
                onClick={() => setSortKey(dimension.id)}
                className={`flex items-center justify-between gap-1 border-b border-l border-border px-3 py-3 text-left text-h3 font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? 'bg-primary-tint text-primary'
                    : 'bg-surface-alt text-text-primary hover:bg-border/50'
                }`}
              >
                {dimension.label}
                {active && <CaretUp size={12} weight="bold" />}
              </button>
            )
          })}

          {sortedOfficers.map((officer) => {
            const isExpanded = expandedId === officer.id
            const { weakest: officerWeakest, strongest: officerStrongest } = officerExtremes(officer)

            return (
              <Fragment key={officer.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : officer.id)}
                  className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 text-left text-body font-medium text-text-primary transition-colors hover:bg-surface-alt"
                >
                  <CaretRight
                    size={12}
                    className={`shrink-0 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                  {officer.name}
                </button>
                {competencyDimensions.map((dimension) => {
                  const cell = officer.cells[dimension.id]
                  return (
                    <div
                      key={dimension.id}
                      className={`flex items-center justify-center border-b border-l px-3 py-3 ${levelCellClasses[cell.level]}`}
                    >
                      {cell.level === 'insufficient' ? (
                        <span className="rounded-sm bg-insufficient-tint px-2 py-0.5 text-micro font-medium text-insufficient">
                          Insufficient data
                        </span>
                      ) : (
                        <span className="text-h2 font-semibold tabular-nums">{cell.score}%</span>
                      )}
                    </div>
                  )
                })}
                {isExpanded && (
                  <div className="col-span-full border-b border-border bg-surface-alt px-4 py-3 text-caption text-text-secondary">
                    Strongest in {officerStrongest.dimension.label.toLowerCase()} (
                    {officerStrongest.cell.score}%), weakest in{' '}
                    {officerWeakest.dimension.label.toLowerCase()} ({officerWeakest.cell.score}%).
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border border-border bg-surface-alt px-4 py-3">
        {(['strong', 'moderate', 'weak'] as const).map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className={`size-3 rounded-sm ${
                level === 'strong' ? 'bg-strong' : level === 'moderate' ? 'bg-moderate' : 'bg-weak'
              }`}
            />
            <span className="text-caption text-text-secondary">{levelLabel[level]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-dashed border-insufficient bg-surface" />
          <span className="text-caption text-text-secondary">Insufficient data</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mt-6 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
      >
        View recommendations
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `OfficersScreen.tsx`**

Replace the full contents of `src/components/screens/OfficersScreen.tsx` with:

```tsx
import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { getOfficerAverage, mockCompetencyMatrix } from '../../mockData'

const STRONG_THRESHOLD = 76

export function OfficersScreen() {
  const [ascending, setAscending] = useState(true)

  const sorted = [...mockCompetencyMatrix].sort((a, b) => {
    const diff = getOfficerAverage(a) - getOfficerAverage(b)
    return ascending ? diff : -diff
  })

  const belowStrong = mockCompetencyMatrix.filter(
    (officer) => getOfficerAverage(officer) < STRONG_THRESHOLD,
  ).length

  return (
    <div className="max-w-2xl">
      <p className="text-h1 font-semibold leading-snug text-text-primary">
        {belowStrong} of {mockCompetencyMatrix.length} officers score below the strong threshold
        overall.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        Ranked by overall competency score across all four dimensions.
      </p>

      <div className="mt-6 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[1fr_140px] border-b border-border bg-surface-alt">
          <span className="px-4 py-3 text-h3 font-semibold uppercase tracking-wide text-text-primary">
            Officer
          </span>
          <button
            type="button"
            onClick={() => setAscending((v) => !v)}
            className="flex items-center justify-end gap-1 px-4 py-3 text-right text-h3 font-semibold uppercase tracking-wide text-text-primary transition-colors hover:bg-border/50"
          >
            Average score
            {ascending ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
          </button>
        </div>
        {sorted.map((officer) => (
          <div
            key={officer.id}
            className="grid grid-cols-[1fr_140px] border-b border-border bg-surface px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-alt"
          >
            <span className="text-body text-text-primary">{officer.name}</span>
            <span className="text-right text-cell font-medium tabular-nums text-text-primary">
              {getOfficerAverage(officer)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite `ReportsScreen.tsx`**

Replace the full contents of `src/components/screens/ReportsScreen.tsx` with:

```tsx
import { FileText } from '@phosphor-icons/react'
import { getStrongestDimension, getWeakestDimension, mockCompetencyMatrix } from '../../mockData'

interface ReportsScreenProps {
  onViewReport: () => void
}

export function ReportsScreen({ onViewReport }: ReportsScreenProps) {
  const weakest = getWeakestDimension()
  const strongest = getStrongestDimension()

  return (
    <div className="card-lift max-w-2xl rounded-sm border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-primary">
          <FileText size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-caption text-text-muted">
            Generated today · {mockCompetencyMatrix.length} officers assessed
          </p>
          <h2 className="mt-1 text-h2 font-semibold text-text-primary">
            Cohort A: AI competency report
          </h2>
          <p className="mt-2 text-body text-text-secondary">
            Strongest in <span className="text-strong">{strongest.label.toLowerCase()}</span>,
            weakest in <span className="text-weak">{weakest.label.toLowerCase()}</span>.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewReport}
        className="mt-4 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
      >
        View report
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `RecommendationsScreen.tsx`**

Replace the full contents of `src/components/screens/RecommendationsScreen.tsx` with:

```tsx
import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import {
  getDimensionAverage,
  getOfficersAtLevel,
  getOverallAverage,
  getWeakestDimension,
  mockCompetencyMatrix,
  mockCourseCatalog,
} from '../../mockData'

interface RecommendationsScreenProps {
  onRestart: () => void
}

export function RecommendationsScreen({ onRestart }: RecommendationsScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const weakest = getWeakestDimension()
  const weakestAverage = getDimensionAverage(weakest.id)
  const overallAverage = getOverallAverage()
  const weakOfficers = getOfficersAtLevel(weakest.id, 'weak')
  const moderateOfficers = getOfficersAtLevel(weakest.id, 'moderate')

  const reasons = [
    `${weakest.label} is the cohort's weakest dimension, averaging ${weakestAverage}% against a ${overallAverage}% overall average.`,
    `${weakOfficers.length} of ${mockCompetencyMatrix.length} officers scored weak here, the largest gap of any dimension.`,
    `${moderateOfficers.length} officers scored moderate and are within range of the strong threshold with targeted review.`,
  ]

  const assignedOfficers = [[...weakOfficers, ...moderateOfficers], weakOfficers, moderateOfficers]

  const ranked = mockCourseCatalog
    .map((course, i) => ({ course, reason: reasons[i], officers: assignedOfficers[i] }))
    .sort((a, b) => b.officers.length - a.officers.length)

  const totalAssignments = ranked.reduce((sum, entry) => sum + entry.officers.length, 0)

  return (
    <div>
      <p className="max-w-[68ch] text-h1 font-semibold leading-snug text-text-primary">
        To close the gap in <span className="text-weak">{weakest.label.toLowerCase()}</span>,
        assign these {ranked.length} iGOT Karmayogi courses across the cohort.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        {totalAssignments} officer assignments recommended, ranked by reach.
      </p>

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {ranked.map(({ course, reason, officers }, i) => {
          const isExpanded = expandedIndex === i
          const isLead = i === 0

          return (
            <div
              key={course.title}
              className={`bg-surface transition-colors hover:bg-surface-alt ${isLead ? 'p-6' : 'p-4'}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-sm font-semibold tabular-nums ${
                    isLead
                      ? 'size-8 bg-primary text-body text-white'
                      : 'size-6 bg-surface-alt text-caption text-text-muted'
                  }`}
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                      {course.provider}
                    </span>
                    <span className="text-micro text-text-muted">{course.format}</span>
                  </div>

                  <h3
                    className={`mt-1.5 font-semibold text-text-primary ${isLead ? 'text-h1' : 'text-h2'}`}
                  >
                    {course.title}
                  </h3>

                  <p className={`mt-1.5 text-text-secondary ${isLead ? 'text-body' : 'text-caption'}`}>
                    {reason}
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="mt-3 flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
                  >
                    {isExpanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                    {officers.length} officer{officers.length === 1 ? '' : 's'} assigned
                  </button>

                  {isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {officers.map((name) => (
                        <span
                          key={name}
                          className="rounded-sm border border-border bg-surface-alt px-2 py-0.5 text-caption text-text-secondary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-sm border border-border bg-surface px-4 py-2 text-body font-medium text-text-primary transition-colors hover:bg-surface-alt"
      >
        Start a new assessment
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from these 4 files.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, log in as Coordinator (Admin).

1. New Assessment → Competency Report: confirm column headers are now uppercase, the legend
   sits in a bordered strip, and sorting/expanding rows still works exactly as before.
2. Officers: confirm the header row is uppercase, rows highlight on hover, and the sort
   toggle still works.
3. Reports: confirm the card now shows a document icon and still opens the report on click.
4. New Assessment → Recommendations: confirm each course row highlights on hover and
   expand/collapse of assigned officers still works.

- [ ] **Step 7: Commit**

```bash
git add src/components/screens/DashboardScreen.tsx src/components/screens/OfficersScreen.tsx src/components/screens/ReportsScreen.tsx src/components/screens/RecommendationsScreen.tsx
git commit -m "refactor: restyle Dashboard/Officers/Reports/Recommendations screens"
```

---

## Task 18: Restyle `SettingsScreen` + add a working Session/switch-role block

**Files:**
- Modify: `src/components/screens/SettingsScreen.tsx` (full rewrite)

**Interfaces:**
- Consumes: `clearRole` from `../../lib/session` (Task 1); `org`, `session` from `../../mockData` (existing, unchanged).
- Produces: same `SettingsScreen()` signature (no props) — `DiagnosticsApp.tsx` needs no changes.

This is the one restyle task that adds real new functionality (not just visual chrome): a
"Session" block with a working "Switch role" button, matching the one already added to
`TopBar` in Task 15 — giving the coordinator a second, discoverable way to log out.

- [ ] **Step 1: Rewrite `SettingsScreen.tsx`**

Replace the full contents of `src/components/screens/SettingsScreen.tsx` with:

```tsx
import { SignOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { clearRole } from '../../lib/session'
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
  const navigate = useNavigate()

  function switchRole() {
    clearRole()
    navigate('/login')
  }

  return (
    <div className="card-lift max-w-md rounded-sm border border-border bg-surface p-6">
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

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-caption text-text-muted">Session</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="inline-flex w-fit items-center rounded-sm bg-primary-tint px-2 py-0.5 text-micro font-medium text-primary">
            Coordinator (Admin)
          </span>
          <button
            type="button"
            onClick={switchRole}
            className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <SignOut size={14} />
            Switch role
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no errors from this file.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in as Coordinator (Admin), go to Settings.

1. Confirm the card now shows an "Organization" block and a "Session" block with a
   "Coordinator (Admin)" badge.
2. Click "Switch role" — confirm it clears the session and returns to `/login`.

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/SettingsScreen.tsx
git commit -m "feat: add a working session/switch-role control to Settings"
```

---

## Task 19: Final integration — full build, lint, test suite, and manual walkthrough

**Files:** none (verification only).

- [ ] **Step 1: Run the full Vitest suite**

Run: `npx vitest run`
Expected: PASS — every test file from Tasks 1–5 (`session`, `thresholds`, `officers`,
`competencyDomains`, `departments`, `rejectionAudit`).

- [ ] **Step 2: Run the TypeScript build**

Run: `npm run build`
Expected: exits 0. This runs `tsc -b && vite build`, so it also catches any type error
across the whole project, not just the files touched in this plan.

- [ ] **Step 3: Run the linter**

Run: `npm run lint`
Expected: no errors (warnings pre-existing before this plan are out of scope; do not
suppress new warnings introduced by this plan's code — fix them).

- [ ] **Step 4: Full manual walkthrough**

Run: `npm run preview` (serves the production build from Step 2) or `npm run dev`.

Officer flow:
1. `/` → click a landing-page CTA → lands on `/login`.
2. `/login` → "Continue as Officer" → `/officer`, "My Dashboard" tab active by default.
3. Confirm all 4 stat cards show a value, a previous-cycle value, and a colored trend
   arrow — no bare numbers.
4. Confirm the Competency Domains panel shows "Digital Governance" as partial (not a bare
   number, not hidden) and the other 3 domains as fully scored.
5. "My Courses" → confirm 3 courses, each naming one of Rohit Malhotra's real weakest
   competencies (`Data Automation & Scripting Tools`, `Statistical Computation`, and the
   third-lowest cycle-4 competency).
6. "Switch role" → back at `/login`.

Admin flow:
7. "Continue as Coordinator (Admin)" → `/app`, sidebar shows both groups fully populated.
8. Dashboard → 6 department cards, each with a status badge, heat-sparkline, progress bar,
   assessed fraction, and review date — confirm at least 2 different statuses appear.
9. New Assessment → walk all 5 sub-steps end to end (Upload → Generate → Assessment →
   Competency Report → Recommendations) exactly as the pre-existing flow did.
10. Officers, Reports → unchanged behavior, restyled appearance.
11. Verification Audit → 18 cards across 4 columns; apply a source-document filter, then a
    rejection-reason filter, then both together, then reset — confirm the visible count and
    cards update correctly each time.
12. Settings → confirm the Session block and "Switch role" work.
13. Directly navigate to `/app` and to `/officer` after clearing `sessionStorage` — confirm
    both redirect to `/login`.

- [ ] **Step 5: Fix anything that fails Steps 1-4 before proceeding**

If any check fails, fix it in the file(s) it points to and re-run that check — do not mark
this task done with a known-failing build, lint, or test.

- [ ] **Step 6: Final commit (only if Step 5 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in final integration pass"
```

---

## Plan Self-Review

**Spec coverage:**
- §3 routing/session → Tasks 7, 8, 11.
- §4 existing-file changes → Tasks 11, 14, 15, 16, 17, 18.
- §5 grouped admin sidebar → Task 14.
- §6 new data files (`competencyDomains.ts`, `departments.ts`, `rejectionAudit.ts`) → Tasks 3, 4, 5 (plus `officers.ts`/`thresholds.ts`, identified during planning as necessary supporting files not named in the spec, per spec §13's acknowledgment that implementation-level judgment calls would be needed).
- §7 LoginPage → Task 8.
- §8 OfficerDashboard/OfficerCourses → Tasks 9, 10, 11.
- §9 AdminCohortOverview → Task 12.
- §10 RejectionAuditBoard → Task 13.
- §11 shared primitives → Tasks 6, 7.
- §12 testing approach → Task 19 (build/lint/manual walkthrough) plus Vitest added in Task 1 for the pure-logic layer, which exceeds the spec's minimum but doesn't contradict it.
- §13 judgment calls (LandingPage excluded, GenerateScreen exception) → encoded directly in Global Constraints and honored in Tasks 11 and 16.

**Placeholder scan:** no TBD/TODO markers; every step above contains complete, runnable code or an exact command.

**Type consistency:** cross-checked `DomainId`, `Confidence`, `DomainScoreSummary`, `AuditStatus`, `RejectionReason`, `VerificationPass`, `Role`, `OfficerSection`, `NavItem`/`NavGroup`/`NavChildItem` — each is defined exactly once (Tasks 1, 2, 3, 5, 9, 11, 14) and every later task imports it by that same name and shape.
