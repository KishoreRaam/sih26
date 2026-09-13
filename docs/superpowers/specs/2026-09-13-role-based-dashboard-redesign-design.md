# Role-based dashboard redesign — design spec

Date: 2026-09-13
Status: approved for planning

## 1. Context

This app (`sih26`, Vite + React 19 + TypeScript + Tailwind v4, `react-router-dom` v7,
`@phosphor-icons/react`, GSAP) is a Smart India Hackathon 2026 prototype for MoSPI/NSSTA:
an AI competency-diagnostic tool. All data is fabricated and lives in client-side mock
files (`src/mockData.ts` today); there is no backend and PRODUCT.md confirms none is
planned. The design system (navy/statistical-blue palette, Noto Sans, semantic
strong/moderate/weak/insufficient competency colors) is locked in `src/index.css` and is
not to be changed.

The user supplied 5 reference screenshots of the Shadcnblocks Admin Kit
(ecommerce/project-management demo) and asked for a full visual redesign of this app's
structure, density, and component patterns — reskinned into the locked navy palette, not
copying the reference's colors, illustration banners, or Next.js-specific code (this repo
uses Vite, not Next.js, so there is nothing Next-specific to strip — noted for completeness).

Scope, per the conversation, is now the **entire app**, not just the three new pages
originally requested: a login/role-gate is added in front of everything, and every
existing screen is restyled into the new denser look. Nothing is left in its old visual
form.

## 2. Goals

1. Add a login page that gates the app into two role-based experiences: **Officer** and
   **Coordinator/Admin**.
2. Build three new pages modeled on specific reference screenshots, using only real data
   from this project's mock taxonomy (never placeholder labels):
   - `OfficerDashboard` (modeled on the Ecommerce Dashboard screenshot)
   - `AdminCohortOverview` (modeled on the Projects grid screenshot)
   - `RejectionAuditBoard` (modeled on the Kanban board screenshot)
3. Fully populate the admin sidebar with grouped sections and nested sub-items, matching
   the reference's structural density (not its labels).
4. Restyle every existing screen (Upload, Generate, Quiz, competency-report/heatmap,
   Officers, Reports, Recommendations, Settings) into the same denser visual language —
   same behavior and data, new visual treatment. Nothing keeps the old look.
5. Do all of this without a backend: session/role state is client-side only
   (`sessionStorage`), matching the rest of the app's mocked nature.

Explicitly out of scope: the marketing `LandingPage` (`src/pages/LandingPage.tsx`) keeps
its current distinct visual identity — only its three call-to-action links change target
(see §4). No new backend, no real authentication, no new charting library dependency
(everything reference-shaped is hand-rolled with SVG/CSS, matching the existing codebase's
style — e.g. `DashboardScreen.tsx`'s hand-rolled heatmap grid).

## 3. Routing & session (new)

```
/            LandingPage           (unchanged, CTAs now point to /login)
/login       LoginPage             (new)
/app         DiagnosticsApp        (existing; admin/coordinator shell, now gated)
/officer     OfficerApp            (new; officer shell, gated)
```

`src/lib/session.ts` — a minimal module exposing `getRole()`, `setRole(role)`,
`clearRole()` backed by `sessionStorage` (`sih26.role`, `'officer' | 'admin'`). No
passwords, no validation — this is the "role-picker" login the user chose explicitly:
two clickable cards, no credential fields.

`src/components/shared/RequireRole.tsx` — wraps `/app` and `/officer`; if the stored
role doesn't match what the route needs, redirect to `/login`. Both shells get a
"Switch role" control (in `TopBar` for admin, in the officer top bar for officer) that
calls `clearRole()` and navigates to `/login`.

## 4. Existing files touched (behavior preserved, visuals updated)

- `src/pages/LandingPage.tsx` — only change: the 3 existing `Link to="/app"` become
  `Link to="/login"`. No visual changes.
- `src/App.tsx` — add `/login` and `/officer` routes.
- `src/mockData.ts` — add `'audit'` to `Section`, `sectionCopy`, `breadcrumbBySection`,
  and `navItems`/`iconByItem` wiring for the new nested group structure (see §5). No
  existing exports are removed or renamed, so `DashboardScreen`, `OfficersScreen`,
  `ReportsScreen`, `RecommendationsScreen`, `QuizScreen`, `UploadScreen`, `GenerateScreen`
  keep reading the same data shapes they do today.
- `src/components/layout/LeftNav.tsx` — rebuilt to render grouped sections with
  collapsible nested sub-items (see §5), replacing the current flat 5-item list.
- `src/components/layout/TopBar.tsx` — add a search input and a notification bell
  (visual chrome, matching the reference's top-bar density) and a "Switch role" action.
  No dark/light theme toggle — the palette is locked to one register by design.
- `src/components/layout/AppShell.tsx` — unchanged structurally (still
  TopBar + LeftNav + content), only spacing/width tweaks if the new LeftNav needs them.
- `src/pages/DiagnosticsApp.tsx` — the `'overview'` section now renders
  `AdminCohortOverview` instead of `OverviewScreen` (which is deleted — its "welcome +
  two links" content is superseded); default initial section becomes `'overview'`; a new
  `'audit'` section renders `RejectionAuditBoard`.
- `src/components/screens/UploadScreen.tsx`, `GenerateScreen.tsx`, `QuizScreen.tsx`,
  `DashboardScreen.tsx`, `OfficersScreen.tsx`, `ReportsScreen.tsx`,
  `RecommendationsScreen.tsx`, `SettingsScreen.tsx` — **visual refresh only**: richer card
  chrome (reusing the existing `card-lift` utility already defined in `index.css`),
  consistent stat-tile styling via the new shared `StatCard` primitive where it fits
  (e.g. Generate's 3 running counters), tighter spacing/type rhythm matching the new
  denser system. No changes to state logic, timing, scoring, or data shapes. Specifically:
  - `GenerateScreen`'s live generated/verified/rejected counters are restyled but do
    **not** grow a fabricated "vs previous run" comparison — they're a one-shot live
    progress readout, not a periodic KPI, and inventing a historical comparison for them
    would misrepresent what's being measured (this cuts against PRODUCT.md's honesty
    principle). This is the one deliberate exception to "every stat card needs a
    comparison," and it's narrow: it applies only to this in-progress counter, not to any
    of the new per-cycle stat cards.
  - `SettingsScreen` gains a "Session" block showing the active role with a "Switch role"
    button, consistent with the new top-bar control.
- `OverviewScreen.tsx` — deleted (superseded by `AdminCohortOverview`).

## 5. Admin sidebar — fully populated, grouped (new structure for `LeftNav`)

Reference pattern: grouped sections, one group with nested expandable sub-items. Ours,
using only real product concepts:

```
Diagnostics
  Dashboard              → AdminCohortOverview
  New Assessment         → expandable:
                             Upload Material
                             Generate Questions
                             Assessment
                             Competency Report
                             Recommendations
  Officers
  Reports
Quality & Governance
  Verification Audit     → RejectionAuditBoard
  Settings
```

"New Assessment" expands to the existing 5-step flow (`step` state in `DiagnosticsApp`)
as sub-items — this mirrors the reference's Projects → Project List 1-4 nesting without
inventing unrelated pages. `LeftNav` needs: group headers (small caps label, non-
interactive), a collapsible parent item (chevron, expands/collapses, remembers state),
and leaf items — all keyboard accessible, all reusing the existing icon-per-item pattern
(`@phosphor-icons/react`).

The Officer shell's nav stays a separate, deliberately short 2-item list (Dashboard, My
Courses) in its own component (§8) — not a reuse of `LeftNav` — so the two shells are
structurally distinct, not a shared tree with a prop flag.

## 6. New mock data files (mockData.ts untouched; existing screens unaffected)

### `src/data/competencyDomains.ts`

- `Domain = { id, name, description }` — 4 real domains: **Statistical Competency**,
  **Technical & AI Competency**, **Digital Governance**, **Behavioural Competency**.
- `TaxonomyCompetency = { id, label, domainId }` — the existing 4 dimensions
  (`sampling`, `survey`, `quality`, `computation` from `mockData.ts`) are reused verbatim
  under **Statistical Competency**; ~6 new named competencies fill the other 3 domains
  (e.g. "AI/ML Fundamentals for Official Statistics", "Data Automation & Scripting
  Tools" under Technical & AI; "Data Privacy & Security Standards", "Digital Service
  Delivery Standards (GIGW)" under Digital Governance; "Stakeholder Communication &
  Reporting", "Ethical Use of AI in Decision-Making" under Behavioural).
- `AssessmentCycle = { id, label, date }` — 4 cycles with real dates leading up to today
  (2026-09-13), so "current cycle" and "previous cycle" comparisons are coherent.
- Per-officer, per-cycle, per-competency scores, each with an explicit
  `confidence: 'scored' | 'insufficient'` flag — insufficient entries render in the
  existing dashed/insufficient visual style already established in `DashboardScreen.tsx`,
  never hidden.
- Helpers: `getOfficerDomainScore`, `getOfficerOverallScore`, `getPreviousCycle`,
  `getDomainCohortAverage`, `getOfficerCycleDelta` (for stat-card trend arrows).

### `src/data/departments.ts`

- Expands the officer roster from 8 to ~30 (the existing 8 named officers are kept,
  ~22 new named officers added) and groups them into 5-6 named departments (e.g. Field
  Operations Division, Survey Design & Methodology, Data Processing & Analytics, Regional
  Training Centre – South, Digital Governance Cell).
- `Department = { id, code, name, officerIds, nextReviewDate }`.
- Named status thresholds (not per-card hardcoding): `ON_TRACK_MIN = 76`,
  `AT_RISK_MIN = 55` (matches the existing `STRONG_THRESHOLD = 76` convention already
  used in `OfficersScreen.tsx`). `getDepartmentStatus(deptId)` derives On Track / At Risk
  / Critical from the department's average score against these constants.
- Helpers: `getDepartmentAvgScore`, `getDepartmentAssessedFraction`.

### `src/data/rejectionAudit.ts`

Starts with a comment block defining the exact fields this mock stands in for, flagged
for backend reconciliation:

```ts
// MOCK FIXTURE — reconcile with backend rejection-logging schema when available.
// Expected real fields:
//   id: string
//   questionId: string
//   questionText: string
//   sourceDocument: string
//   status: 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'
//   rejectionReason: 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null
//   verificationPass: 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'
//   reviewedAt: string (ISO timestamp)
//   confidenceScore: number | null
```

- `mockRejectionAuditItems` — ~18 items spread across the 4 statuses, referencing 3-4
  source documents (the existing `mockUpload.fileName` plus 2-3 more fabricated NSSTA
  document names), all 3 rejection-reason values, all 3 verification-pass values.
- Verification pass is shown as a **distinct icon per pass type** (Robot for first-pass
  LLM, CheckSquare for deterministic check, ShieldWarning for second-pass adversarial),
  not a human avatar — these are pipeline stages, not people, and a fake human avatar
  would misrepresent an automated step.

## 7. New page: LoginPage (`src/pages/LoginPage.tsx`)

Two large cards on the locked navy palette (no illustration banners): "Continue as
Officer" and "Continue as Coordinator (Admin)". Selecting one calls `setRole()` and
navigates to `/officer` or `/app`.

Since this is a role-picker with no credentials, "Continue as Officer" doesn't identify
*which* officer. Matching the existing pattern where the coordinator identity ("Divya
Prakash") is a fixed constant in `mockData.ts`, `departments.ts` designates one specific
named officer (chosen for having a realistic mix of strong, moderate, and one
insufficient-data domain, so the empty-state requirement in §8 is actually exercised) as
the fixed signed-in officer for this demo. Not a generic "current user" abstraction —
just a named constant, same as `session` today.

## 8. New page: OfficerDashboard (`src/components/officer/OfficerDashboard.tsx`)

Lives inside a new, separate `src/pages/OfficerApp.tsx` shell with its own short top
bar/nav (`src/components/officer/OfficerTopBar.tsx` — Dashboard / My Courses / Switch
role), not sharing `AppShell`/`LeftNav` with the admin side.

- Header: "Welcome back, {officer first name}" + one-line summary of gap count and
  recommended-course count, derived from the officer's actual weakest domain/competency.
- 4 stat cards using the shared `StatCard` primitive (§11): Overall Progress %,
  Competencies Assessed, Learning Hours, Courses Completed — each compared against the
  officer's own previous assessment cycle (from `competencyDomains.ts`), with a real
  trend arrow and percentage, never a bare number.
- Hand-rolled bar chart (shared `TrendBarChart`, §11) of the officer's overall score
  across the 4 assessment cycles.
- "Competency Domains" side panel: total average score, a segmented horizontal bar
  (shared `SegmentedBar`, §11) showing the proportion of competencies per domain, and a
  breakdown table below (domain name, score, trend arrow) — using the 4 real domain
  names from `competencyDomains.ts`. Any domain with insufficient data renders visibly
  differently (dashed border, "Insufficient data" label), never hidden.
- `OfficerCourses` (`src/components/officer/OfficerCourses.tsx`) — the officer's own
  slice of the existing `mockCourseCatalog`/recommendation logic, filtered to their
  weakest competencies, reusing `RecommendationsScreen`'s existing helper functions
  rather than duplicating that logic.

## 9. New page: AdminCohortOverview (`src/components/admin/AdminCohortOverview.tsx`)

Becomes the admin/coordinator's landing page (`'overview'` section in `DiagnosticsApp`).
Card grid, one card per department (`departments.ts`):

- Colored status badge (On Track / At Risk / Critical) from `getDepartmentStatus`.
- Department code + name.
- "Avg competency" labeled progress bar with percentage.
- "Officers assessed" as a fraction (assessed/total).
- Next review cycle date.
- A small heat-sparkline (shared `HeatSparkline`, §11) showing that department's
  competency spread, replacing the reference's illustration banner slot entirely — no
  illustration images anywhere in this app.

## 10. New page: RejectionAuditBoard (`src/components/admin/RejectionAuditBoard.tsx`)

New `'audit'` section under "Quality & Governance" in the admin nav. Four Kanban columns
(Rejected / Needs Manual Review / Verified / Flagged) built from
`mockRejectionAuditItems`. Each card: question ID, ~2-line truncated question text,
source document name, a colored rejection-reason tag (one distinct color per reason,
same visual weight as the reference's priority tags — reusing the existing
strong/moderate/weak semantic tokens is deliberately avoided here since rejection
reasons aren't a strong/weak spectrum; three new distinct accent treatments are used
instead so this doesn't collide with the competency color language), timestamp, and the
verification-pass icon (§6). Genuinely filterable by source document and by rejection
reason via two `<select>` controls plus a reset action — this filters the rendered set,
it's not decorative.

## 11. New shared primitives (`src/components/shared/`)

Extracted because all three new pages need them (not speculative — each is used ≥2
places):

- `StatCard.tsx` — big number, small previous-value line, colored trend arrow + %.
- `SegmentedBar.tsx` — proportional horizontal segmented bar with a legend.
- `TrendBarChart.tsx` — simple hand-rolled bar chart (SVG/CSS, no new dependency).
- `HeatSparkline.tsx` — small row of colored cells representing a score spread, reusing
  the existing `strong`/`moderate`/`weak`/`insufficient` tokens.
- `RequireRole.tsx` — route guard (§3).

## 12. Testing approach

No test framework exists in this repo today (no test runner in `package.json`). This
stays a visually-verified hackathon prototype: after implementation, run `npm run build`
(catches TypeScript errors across all touched/new files) and `npm run lint`, then
manually walk both role flows (`/login` → officer → dashboard/courses/switch-role;
`/login` → admin → cohort overview → each nav item including the nested "New Assessment"
sub-items → audit board filters → settings switch-role) to confirm behavior parity with
today's app plus the new pages.

## 13. Open risk / judgment calls made without further user sign-off

- LandingPage is excluded from the visual redesign (its own distinct identity, not part
  of the admin-kit reference set) — flagged in §2, easy to reverse if wrong.
- GenerateScreen's live counters don't get a fabricated comparison value (§4) — a
  deliberate, narrow exception to "every stat card needs a comparison," justified by
  PRODUCT.md's honesty principle rather than by convenience.
