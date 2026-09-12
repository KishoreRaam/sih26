# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: NSSTA (National Statistical Systems Training Academy) training coordinators - the person running an AI competency diagnostic on a training cohort, reading the resulting report, and deciding what training to assign. The persona used throughout the build ("Divya Prakash, Training Coordinator, NSSTA") represents this user.

Other roles appear in the flow (officers who take the assessment, MoSPI-level reviewers of rolled-up reports) but are not the primary confirmed user.

## Product Purpose

An AI-powered diagnostic tool for MoSPI's National Statistical Systems Training Academy that turns existing training/reference material into a diagnostic instrument: it generates and verifies source-cited assessment questions from an uploaded document, measures officers' AI/statistical competency across dimensions, visualizes gaps across a cohort as a competency heatmap, and recommends targeted iGOT Karmayogi training per gap. It exists as a Smart India Hackathon 2026 prototype submission for MoSPI/NSSTA evaluation - success means the panel understands the mechanism and finds it credible, not production deployment.

## Positioning

Every generated question is traceable to the specific page/paragraph of the uploaded material it came from, and the competency report is explicit when there isn't enough data to score someone rather than guessing. A generic AI-training-platform question bank could not truthfully make either claim without doing this same grounding and honesty work.

## Operating Context

A single training coordinator runs one cohort's diagnostic session end to end in one sitting: upload reference material, AI drafts and verifies questions against it, officers take the assessment, results roll up into a competency heatmap by dimension, and gaps map to specific iGOT Karmayogi courses with per-officer assignment. Used live, desktop-only, in a short (3-4 minute) hackathon demo in front of a judging panel.

## Capabilities and Constraints

- All data (officers, scores, quiz questions, uploaded-file behavior, course catalog, reports) is mocked and simulated in React state. There is no real backend and none is planned - confirmed as a pure hackathon prototype, not a staged rollout.
- iGOT Karmayogi is used as a plausible, named real-world integration point in the product narrative, but an actual integration is **not confirmed** - undecided/provisional.
- Bilingual Hindi+English support is **not a confirmed hard requirement**. Noto Sans was chosen as a bilingual-ready default typeface, but that is a design choice made ahead of any confirmed requirement, not product truth.
- Desktop-only; no responsive/mobile requirement.

## Brand Commitments

Ministry of Statistics and Programme Implementation (MoSPI) / National Statistical Systems Training Academy (NSSTA) naming and framing throughout. Always presented honestly as a "Smart India Hackathon 2026 prototype" - never implying official government endorsement, partnership, or deployment.

## Evidence on Hand

None. Every officer name, score, quiz question, source citation, course listing, and report in this build is fabricated for demonstration purposes. Future work must not treat any of it as real data or real content.

## Product Principles

1. Every AI-generated judgment must be traceable to its source (a page/paragraph citation) - never a black box.
2. The report is honest about what it doesn't know: insufficient data is shown explicitly, never guessed at or silently filled in.
3. The product's own register is official, calm, and data-forward - a statistics-ministry instrument, not a startup or marketing product, even where the separate landing page is more expressive.
4. One coherent semantic color language for competency levels (strong/moderate/weak/insufficient), reused consistently rather than inventing new meanings per screen.

## Accessibility & Inclusion

GIGW (Government of India Web Guidelines) / GoI accessibility compliance is a confirmed real requirement for this product, though not yet audited or implemented in this prototype.
