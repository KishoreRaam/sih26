# Dark re-theme + officer engagement features — design spec

Date: 2026-09-14
Status: approved for planning
Builds on: `docs/superpowers/specs/2026-09-13-role-based-dashboard-redesign-design.md` (the role-based
redesign this spec extends — read that first for the existing IA, data model, and design-system
conventions this spec assumes).

## 1. Context

The role-based dashboard redesign (spec `2026-09-13-...`) shipped a light navy/institutional palette
across a login flow, an Officer shell (Dashboard + Courses), and an Admin shell (Cohort Overview,
Verification Audit, plus the pre-existing diagnostic flow). The user has now asked for two things:

1. **A full dark re-theme** of the app (not the marketing `LandingPage`, which keeps its own separate
   identity as established in the prior spec) — replacing the light palette outright, not adding it as
   a toggle.
2. **Three new features**, each modeled on a specific reference screenshot from the Shadcnblocks Admin
   Kit (same reference family as the original redesign, different screens): a redesigned officer
   course-catalog page (project-card grid pattern), an officer-to-officer directory with mock messaging
   ("Officers Connect"), and an admin-facing course-progress tracker. Plus a fourth requirement not tied
   to a specific screenshot: clickable officer profile pages, reachable from the admin side.

Every existing component already consumes semantic Tailwind tokens (`bg-surface`, `text-text-primary`,
`bg-strong-tint`, etc.) rather than hardcoded colors — this is what makes a systemic re-theme tractable
as mostly a token swap rather than a per-component rewrite.

## 2. Goals

1. Redefine `src/index.css`'s `@theme` block with a dark palette under the same token names, so every
   existing page/component re-themes with no changes, except the handful of places (identified in §3)
   that reference `bg-primary`/`text-white` as literal chrome-band colors rather than through a token
   that flips sensibly.
2. Redesign `OfficerCourses` as a card grid (project-card reference pattern) with real per-officer course
   progress, decorative banner art per card.
3. Add "Officers Connect" — a searchable officer directory with a mock per-officer message panel — as a
   third tab in the Officer shell.
4. Add a new admin-facing "Course Progress" page (table pattern from the shipment-tracker reference),
   reachable from a new nav item under the existing "Diagnostics" group.
5. Add Officer Profile pages, reachable by drilling into a department card on `AdminCohortOverview` to
   see its officer list, then into an individual officer.

Out of scope, explicitly: `LandingPage.tsx` (keeps its current light, separate identity — not mentioned
in this request and already carved out by the prior spec); the existing 8-officer diagnostic-flow cohort
and its screens (`OfficersScreen`, `DashboardScreen`, `RecommendationsScreen`, `ReportsScreen`, and the
Upload→Generate→Quiz flow) — these get the dark re-theme via the token swap like everything else, but
their data model, IA, and behavior are untouched; profiles and connect features apply to the new
30-officer roster (`departments.ts`/`officers.ts`), not this older, protected cohort.

## 3. Dark palette (exact values — replaces the `@theme` block in `src/index.css`)

Same token names, same semantic roles, new values. Hue families are preserved (navy-blue primary,
slate secondary, amber accent, green/amber/red for strong/moderate/weak) so the re-theme reads as a
mode change, not a rebrand.

```css
@theme {
  /* Brand */
  --color-primary: #4f9fd6;
  --color-primary-hover: #6bb2e0;
  --color-primary-tint: #16283a;
  --color-secondary: #8b98a8;
  --color-accent: #e0a542;
  --color-accent-tint: #2e2413;

  /* Neutrals */
  --color-bg: #0a0e14;
  --color-surface: #12171f;
  --color-surface-alt: #1a2129;
  --color-border: #262e38;
  --color-border-strong: #3a4552;
  --color-text-primary: #eef1f4;
  --color-text-secondary: #a6b0bb;
  --color-text-muted: #707b87;

  /* Semantic: competency levels */
  --color-strong: #3fb389;
  --color-strong-tint: #123326;
  --color-moderate: #dba63f;
  --color-moderate-tint: #332711;
  --color-weak: #d97a5c;
  --color-weak-tint: #35201a;
  --color-insufficient: #98a3af;
  --color-insufficient-tint: #1c222a;

  /* System */
  --color-system-error: #e2604a;
  --color-focus-ring: #e0a542;

  /* Type, radius: unchanged from the light theme */
}
```

**Component-level touch-ups required** (the token swap alone would misrender these — they reference
`bg-primary`/`text-white` as a literal colored chrome band, which in the new palette would render as a
bright-blue banner rather than matching the reference's monochrome-dark-chrome-with-accents look):

- `TopBar.tsx`, `OfficerTopBar.tsx`: header background changes from `bg-primary` to `bg-surface` (matching
  the sidebar/content tone, with the existing `border-b` now resolving to the dark border token), and the
  two literal `text-white` usages (product name heading, session/officer name) change to `text-text-primary`.
  The `white/NN` opacity utilities (icon chip backgrounds, breadcrumb secondary text, avatar chip) are
  left as-is — they still render as sensible subtle light accents against any dark background.
- `.card-lift` (in `index.css`): its hover `box-shadow` is hardcoded to a navy-tinted shadow
  (`rgba(11, 58, 92, 0.32)`) that would be invisible on a near-black surface. Replace with a shadow that
  reads on dark: a darker, more neutral drop shadow plus a faint bright-blue ring, e.g.
  `0 0 0 1px rgba(79, 159, 214, 0.18), 0 12px 28px -14px rgba(0, 0, 0, 0.65)`.

No other component is expected to need class-level edits — `LeftNav`'s active-item highlight
(`bg-primary-tint text-primary`), every card/table/badge across the app, and all semantic score-level
coloring should re-theme correctly from the token swap alone, since they were already built against the
semantic system rather than hardcoded values. The implementation plan must verify this live in a browser
per page, not assume it.

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
  not-started) so his Courses page and profile tell a coherent, checkable story, the same way his
  competency scores already do.

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
- Status badge (top-left, from `CourseAssignment.status`, using the same semantic tone family as
  elsewhere: not-started → muted/insufficient tone, in-progress → moderate tone, completed → strong tone).
- Course code, title, provider/format line (reusing the existing course-card typography conventions).
- Progress bar with percentage and a "modules completed X/Y" line (reference's "Tasks closed" pattern).
- Due date.

## 6. Officers Connect (officer-facing, new third tab)

`OfficerTopBar` gains a third tab, "Connect", alongside "My Dashboard" and "My Courses".

- Searchable/filterable grid of officer profile cards (avatar initials in a colored chip — no photos,
  consistent with the existing `initials()` pattern already used elsewhere), name, department, a
  domain-expertise badge (see §4), and a simulated availability badge (Available/Offline — explicitly
  simulated presence, not derived from any real signal, since none exists).
- A "Message" button opens a simple panel: an empty-state "Start a conversation" or a short mock thread,
  plus a text input to send a message. Messages persist only in React component state for the session —
  no backend, no persistence across reloads, consistent with the rest of this prototype.

## 7. Course Progress (admin-facing, new nav item)

New "Course Progress" item added to the existing "Diagnostics" nav group (alongside Dashboard/New
Assessment/Officers/Reports), rendering inside `DiagnosticsApp`'s existing section-switch pattern.

Table modeled on the reference's shipment-tracker pattern: officer name, course title, department,
status badge, a progress bar (or the reference's step-dot pattern — implementation plan decides which
reads better against real data), due date. Filterable by department, course, and status, following the
same genuinely-functional-filter bar established by `RejectionAuditBoard`.

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
- Officer shell tabs: My Dashboard, My Courses, **Connect (new)**.
- Officer Profile is a drill-down state, not a nav item — reached only via
  `AdminCohortOverview → department → officer`.

## 10. Testing approach

Same as the prior spec: no component test framework in this repo; Vitest covers new pure data/logic
(course-assignment lookups, expertise derivation, filter helpers) the same way the existing data layer
is tested. Visual/behavioral verification is manual, live-browser, per page — and given this round's
main risk is the re-theme rendering illegibly somewhere token-swap coverage missed, the implementation
plan must include a page-by-page dark-mode legibility pass (every existing page, not just the new ones)
before considering this done.

## 11. Judgment calls made without further user sign-off

- `LandingPage.tsx` stays excluded from the re-theme (not mentioned in this request; already carved out
  by the prior spec as having its own distinct identity). Easy to reverse if wrong.
- `TopBar`/`OfficerTopBar`'s header chrome gets targeted class edits (not just token values) so the
  dark theme reads as monochrome-chrome-with-accents (matching the reference) rather than a bright-blue
  banner — reasoned in §3.
- Course Progress's per-row visual (progress bar vs. the reference's step-dot pattern) is left for the
  implementation plan to decide against real data, rather than locked here.
