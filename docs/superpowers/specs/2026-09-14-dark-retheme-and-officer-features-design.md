# Light palette refinement + officer engagement features — design spec

Date: 2026-09-14 (revised same day — see §3 revision note)
Status: approved for planning
Builds on: `docs/superpowers/specs/2026-09-13-role-based-dashboard-redesign-design.md` (the role-based
redesign this spec extends — read that first for the existing IA, data model, and design-system
conventions this spec assumes).

## 1. Context

The role-based dashboard redesign (spec `2026-09-13-...`) shipped a light navy/institutional palette
across a login flow, an Officer shell (Dashboard + Courses), and an Admin shell (Cohort Overview,
Verification Audit, plus the pre-existing diagnostic flow). The user has asked for:

1. **A precise color-system correction** (see §3's revision note — this superseded an earlier dark-theme
   draft of this same spec).
2. **Three new features**, each modeled on a specific reference screenshot from the Shadcnblocks Admin
   Kit: a redesigned officer course-catalog page (project-card grid pattern), an officer-to-officer
   directory with mock messaging ("Officers Connect"), and an admin-facing course-progress tracker. Plus
   a fourth requirement not tied to a specific screenshot: clickable officer profile pages, reachable
   from the admin side.
3. **A substantially more populated OfficerDashboard** — the current build (header + 4 stat cards + a
   2-card row) reads as thin next to the reference's dense card grid; §5a adds real content, not filler.

Every existing component already consumes semantic Tailwind tokens (`bg-surface`, `text-text-primary`,
`bg-strong-tint`, etc.) rather than hardcoded colors — this is what makes the palette correction in §3 a
targeted token/value change rather than a per-component rewrite.

## 2. Goals

1. Tighten `src/index.css`'s `@theme` block to the precise light, slate-neutral palette specified in §3,
   with semantic status colors following the reference's pill-badge convention (soft tint background,
   saturated text of the same hue, fully rounded shape).
2. Substantially populate `OfficerDashboard` with real additional content (§5a) so it reads as a full
   home dashboard, not two widgets under a stat-card row.
3. Redesign `OfficerCourses` as a card grid (project-card reference pattern) with real per-officer course
   progress, decorative banner art per card.
4. Add "Officers Connect" — a searchable officer directory with a mock per-officer message panel — as a
   third tab in the Officer shell.
5. Add a new admin-facing "Course Progress" page (table pattern from the shipment-tracker reference),
   reachable from a new nav item under the existing "Diagnostics" group.
6. Add Officer Profile pages, reachable by drilling into a department card on `AdminCohortOverview` to
   see its officer list, then into an individual officer.

Out of scope, explicitly: `LandingPage.tsx` (keeps its current light, separate identity — not mentioned
in this request and already carved out by the prior spec); the existing 8-officer diagnostic-flow cohort
and its screens (`OfficersScreen`, `DashboardScreen`, `RecommendationsScreen`, `ReportsScreen`, and the
Upload→Generate→Quiz flow) — these get the palette refinement via the token swap like everything else,
but their data model, IA, and behavior are untouched; profiles and connect features apply to the new
30-officer roster (`departments.ts`/`officers.ts`), not this older, protected cohort.

## 3. Palette (exact values — replaces the `@theme` block in `src/index.css`)

**Revision note:** an earlier draft of this spec called for a full dark re-theme, based on the first
reference screenshots shown (which were dark-mode Admin Kit captures). The user has since specified the
actual target precisely — a light, slate-neutral base with semantic pill-badge status colors, matching
the shipment-tracker reference's real palette — and repeated the request to populate the officer
dashboard densely. This section reflects that correction; the dark palette is dropped entirely, not kept
as an option.

Specified directly by the user: light gray page background, white card/table surfaces, dark-slate primary
text, medium-gray icons/borders, and five semantic pill-badge treatments (soft tint background + darker
saturated text of the same hue, fully rounded shape — not the existing `rounded-sm` 4px badges).

```css
@theme {
  /* Brand — unchanged from the original locked palette; the user's correction addresses the
     neutral base and status semantics, not the brand blue */
  --color-primary: #0b3a5c;
  --color-primary-hover: #092e49;
  --color-primary-tint: #e4ebf1;
  --color-secondary: #45607a;
  --color-accent: #a66a00;
  --color-accent-tint: #f5ebd8;

  /* Neutrals — per the user's exact spec */
  --color-bg: #f9fafb;
  --color-surface: #ffffff;
  --color-surface-alt: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-strong: #94a3b8;
  --color-text-primary: #0f172a;
  --color-text-secondary: #1e293b;
  --color-text-muted: #64748b;

  /* Semantic: competency levels / status pills */
  --color-strong: #166534;
  --color-strong-tint: #dcfce7;
  --color-moderate: #92400e;
  --color-moderate-tint: #fef3c7;
  --color-weak: #991b1b;
  --color-weak-tint: #fee2e2;
  --color-insufficient: #475569;
  --color-insufficient-tint: #f1f5f9;

  /* System */
  --color-system-error: #991b1b;
  --color-focus-ring: #a66a00;

  /* Type, radius: unchanged, except badges below */
}
```

**Badge shape:** every status/semantic pill badge (competency level, department status, course status,
rejection-reason tag, connect-availability badge) changes from `rounded-sm` to `rounded-full`, matching
the reference's pill shape. This is a shared, mechanical class change across every badge in the app —
the implementation plan should apply it everywhere a semantic-tint badge currently exists, not just in
new pages.

**Categorical identity markers** (the reference's carrier dots — distinct hues per category, unrelated to
score level): used for the 4 competency domains wherever they need a categorical (not score-level) color,
per the existing rule from the prior spec (`primary`/`secondary`/`accent`/`text-secondary`) — no new
tokens needed, that rule already gives 4 distinct hues.

**No component-level chrome edits are needed this round** — unlike the dropped dark-theme draft, this is
a light-to-light refinement close to the original palette, so `TopBar`/`OfficerTopBar`'s `bg-primary`
header band continues to work correctly with no changes.

## 4. New data

### `src/data/courses.ts`

A richer, standalone course catalog for the new features (the original `mockCourseCatalog` in
`mockData.ts` is untouched — still used by the protected `RecommendationsScreen`).

- `Course = { id, code, title, provider, format, domainId, bannerVariant }` — 8-10 courses spanning all
  4 competency domains (reusing `DomainId` from `competencyDomains.ts`), each with a real, specific title
  (no "Course 1" placeholders) and a `bannerVariant` key selecting one of a small set of hand-authored
  CSS/SVG gradient banner treatments (no raster images, no external image dependency).
- `CourseAssignment = { officerId, courseId, status: 'not_started' | 'in_progress' | 'completed',
  percentComplete, modulesCompleted, modulesTotal, dueDate }` — assignments across the 30-officer roster,
  with real variation in status/progress (not every officer at 0% or 100%) so the admin Course Progress
  table and the officer's own Courses page both have something genuine to show. The featured officer
  (Rohit Malhotra) gets a hand-authored, deliberately varied set (some completed, some in-progress, one
  not-started) so his Courses page, dashboard, and profile all tell one coherent, checkable story, the
  same way his competency scores already do.

### Officer "expertise" for Connect

No new officer fields needed — each officer's Connect-card expertise label derives from their strongest
scored competency domain this cycle, computed via the existing `getOfficerDomainScore` across all 4
domains (reusing established functions, not new data).

## 5. OfficerCourses redesign (officer-facing)

Card grid, one card per assigned course (from `CourseAssignment` filtered to the signed-in officer),
modeled on the reference's project-card layout:

- Decorative banner (top of card) using the course's `bannerVariant` — a hand-authored CSS/SVG gradient
  pattern, not a raster image. This is a deliberate, narrow exception to the "no illustration banners"
  rule from the prior spec, scoped to courses only (a course catalog is exactly the kind of content
  illustration banners suit; department/officer cards keep the heat-sparkline treatment, unchanged).
- Status pill (top-left, from `CourseAssignment.status`, `rounded-full` per §3: not-started → the
  insufficient/neutral tone, in-progress → the moderate tone, completed → the strong tone).
- Course code, title, provider/format line (reusing the existing course-card typography conventions).
- Progress bar with percentage and a "modules completed X/Y" line (reference's "Tasks closed" pattern).
- Due date.

## 5a. OfficerDashboard enrichment (officer-facing — addresses "don't leave the dashboard blank")

The existing dashboard (header + 4 stat cards + a chart/domains 2-card row) stays, and gains three more
real, data-backed cards so the page reads as a full bento-style home dashboard rather than two sections.
Every addition surfaces data that already exists elsewhere in the app — nothing here is invented filler:

- **My Courses summary card** — the officer's 2-3 most relevant course assignments (from §4's
  `CourseAssignment` data) as compact progress rows, with a link to the full "My Courses" tab.
- **My Department card** — the officer's department (from `departments.ts`), showing its avg competency
  score and officers-assessed fraction, the same real aggregate `AdminCohortOverview` already computes,
  giving the officer context on how their department is doing.
- **Connect suggestions card** — 2-3 officers with complementary or matching domain expertise (from §4's
  expertise derivation) as a compact preview, with a link to the full "Connect" tab.

This turns the dashboard into 4 stat cards + 5 content cards (trend chart, competency domains, courses
summary, department snapshot, connect suggestions) — genuinely dense, all real data, no placeholder
sections.

## 6. Officers Connect (officer-facing, new third tab)

`OfficerTopBar` gains a third tab, "Connect", alongside "My Dashboard" and "My Courses".

- Searchable/filterable grid of officer profile cards (avatar initials in a colored chip — no photos,
  consistent with the existing `initials()` pattern already used elsewhere), name, department, a
  domain-expertise badge (see §4), and a simulated availability pill (Available/Offline — explicitly
  simulated presence, not derived from any real signal, since none exists).
- A "Message" button opens a simple panel: an empty-state "Start a conversation" or a short mock thread,
  plus a text input to send a message. Messages persist only in React component state for the session —
  no backend, no persistence across reloads, consistent with the rest of this prototype.

## 7. Course Progress (admin-facing, new nav item)

New "Course Progress" item added to the existing "Diagnostics" nav group (alongside Dashboard/New
Assessment/Officers/Reports), rendering inside `DiagnosticsApp`'s existing section-switch pattern.

Table modeled on the reference's shipment-tracker pattern: officer name, course title, department,
status pill (`rounded-full` per §3), a progress bar, due date. Filterable by department, course, and
status, following the same genuinely-functional-filter bar established by `RejectionAuditBoard`.

## 8. Officer Profiles (admin-facing drill-down, not a new nav item)

`AdminCohortOverview`'s department cards gain a "View officers" expand/link revealing that department's
officer list (name, overall score, status). Clicking an officer opens a profile page: a generalized
version of the existing officer stat-card + domain-breakdown layout (the same shape `OfficerDashboard`
already uses for the signed-in officer), parameterized by officer id instead of hardcoded to
`FEATURED_OFFICER_ID`, plus that officer's course progress from §4's data. Admin-framed copy (no "My"/
"Welcome back" language), with a way back to the department view.

This reuses the existing stat-card/segmented-bar/domain-breakdown presentation rather than inventing a
new layout — the same data (competency domains, cycles, scores) just viewed for an arbitrary officer
instead of the one fixed featured officer.

## 9. Nav placement summary

- Admin `navGroups` (Diagnostics group): Dashboard, New Assessment (5 sub-steps, unchanged), Officers
  (unchanged, old cohort), Reports (unchanged), **Course Progress (new)**.
- Officer shell tabs: My Dashboard (enriched, §5a), My Courses (redesigned, §5), **Connect (new)**.
- Officer Profile is a drill-down state, not a nav item — reached only via
  `AdminCohortOverview → department → officer`.

## 10. Testing approach

Same as the prior spec: no component test framework in this repo; Vitest covers new pure data/logic
(course-assignment lookups, expertise derivation, filter helpers) the same way the existing data layer
is tested. Visual/behavioral verification is manual, live-browser, per page — including confirming every
existing semantic badge across the app picked up the `rounded-full` shape change, not just new ones.

## 11. Judgment calls made without further user sign-off

- `LandingPage.tsx` stays excluded from the palette refinement (not mentioned in this request; already
  carved out by the prior spec as having its own distinct identity). Easy to reverse if wrong.
- Brand `--color-primary` (and its hover/tint) kept at the original locked value — the user's correction
  specified the neutral base and status semantics precisely but didn't address brand blue directly.
- Course Progress's per-row visual (progress bar, matching the reference's percentage style rather than
  its step-dot carrier-tracking style, since officer course completion isn't a multi-stage shipment) is
  a direct application of §7, not left open.
- OfficerDashboard's 3 new cards (§5a) were chosen to surface real, already-modeled data (courses,
  department, connect) rather than invent new concepts — reversible/adjustable individually if the mix
  isn't right once built.
