import { useEffect, useRef, type ReactNode } from 'react'
import {
  CaretUp,
  ChartBar,
  ClipboardText,
  GraduationCap,
  Sparkle,
  Target,
  UploadSimple,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import {
  competencyDimensions,
  getOfficersAtLevel,
  getWeakestDimension,
  mockCompetencyMatrix,
  mockCourseCatalog,
  mockQuiz,
} from '../mockData'

const shortDimLabel: Record<string, string> = {
  sampling: 'Sampling',
  survey: 'Survey',
  quality: 'Quality',
  computation: 'Computation',
}

function levelClasses(level: string) {
  if (level === 'strong') return 'bg-strong-tint text-strong'
  if (level === 'moderate') return 'bg-moderate-tint text-moderate'
  if (level === 'weak') return 'bg-weak-tint text-weak'
  return 'border border-dashed border-insufficient text-insufficient'
}

/** Fades a section's content up into place once, the first time it enters view. No-op under reduced motion. */
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

function LandingHeader() {
  return (
    <header className="border-b border-primary-hover bg-primary">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <span className="flex size-8 items-center justify-center rounded-sm bg-white/10">
            <Target size={18} weight="bold" />
          </span>
          <span className="text-h2 font-semibold">MoSPI · NSSTA</span>
        </Link>
        <Link
          to="/app"
          className="rounded-sm border border-white/30 px-4 py-1.5 text-caption font-medium text-white transition-colors hover:bg-white/10"
        >
          Try the live demo
        </Link>
      </div>
    </header>
  )
}

function HeroHeatmapPreview() {
  const rows = mockCompetencyMatrix.slice(0, 5)
  return (
    <div
      className="hero-rise relative overflow-hidden rounded-sm border border-border bg-surface p-4"
      style={{ animationDelay: '120ms' }}
    >
      <div className="flex items-center gap-1.5">
        <span className="live-pulse size-1.5 rounded-full bg-strong" aria-hidden="true" />
        <p className="text-caption text-text-muted">Live preview: cohort competency report</p>
      </div>
      <div
        className="mt-3 grid overflow-hidden rounded-sm border border-border"
        style={{ gridTemplateColumns: `100px repeat(${competencyDimensions.length}, 1fr)` }}
      >
        <div className="border-b border-border bg-surface-alt px-2 py-2" />
        {competencyDimensions.map((dimension) => (
          <div
            key={dimension.id}
            className="border-b border-l border-border bg-surface-alt px-2 py-2 text-micro font-semibold text-text-primary"
          >
            {shortDimLabel[dimension.id]}
          </div>
        ))}

        {rows.map((officer) => (
          <div key={officer.id} className="contents group/row">
            <div className="truncate border-b border-border px-2 py-2 text-caption text-text-primary transition-colors group-hover/row:bg-surface-alt">
              {officer.name.split(' ')[0]}
            </div>
            {competencyDimensions.map((dimension) => {
              const cell = officer.cells[dimension.id]
              return (
                <div
                  key={dimension.id}
                  className={`flex items-center justify-center border-b border-l border-border px-2 py-2 text-caption font-medium tabular-nums transition-[filter] group-hover/row:brightness-95 ${levelClasses(cell.level)}`}
                >
                  {cell.score !== null ? `${cell.score}%` : 'n/a'}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-8 pb-20 pt-16">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
          <div className="hero-rise">
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.02em] text-text-primary md:text-5xl">
              Turn NSSTA training material into a diagnostic instrument.
            </h1>
            <p className="mt-4 max-w-[52ch] text-body text-text-secondary">
              Upload a reference document. Get AI-generated, source-cited questions, a
              competency heatmap by officer, and targeted training, in minutes.
            </p>
            <Link
              to="/app"
              className="mt-6 inline-flex items-center rounded-sm bg-primary px-5 py-2.5 text-body font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Try the live demo
            </Link>
          </div>
          <HeroHeatmapPreview />
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: UploadSimple,
    name: 'Upload',
    description: 'Add NSSTA reference material: PDF, DOCX or TXT.',
  },
  {
    icon: Sparkle,
    name: 'Generate',
    description: 'AI drafts and verifies diagnostic questions grounded in that material.',
  },
  {
    icon: ClipboardText,
    name: 'Assess',
    description: 'Officers answer, with every question linked to its source page and paragraph.',
  },
  {
    icon: ChartBar,
    name: 'Diagnose',
    description: 'Results roll up into a competency heatmap across the cohort.',
  },
  {
    icon: GraduationCap,
    name: 'Recommend',
    description: 'Each gap maps to a specific iGOT Karmayogi course.',
  },
]

/**
 * Pins on scroll and scrubs a progress fill + sequential icon activation across
 * the five steps. Falls back to the plain static row under reduced motion.
 */
function StepsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const fill = fillRef.current
    const counter = counterRef.current
    if (!section || !fill) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const icons = iconRefs.current.filter((el): el is HTMLSpanElement => el !== null)
      gsap.set(fill, { scaleX: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!counter) return
            const active = Math.min(icons.length, Math.floor(self.progress * icons.length) + 1)
            counter.textContent = `${active} / ${icons.length}`
          },
        },
      })

      tl.to(fill, { scaleX: 1, ease: 'none', duration: 1 }, 0)

      icons.forEach((icon, i) => {
        const at = i / icons.length
        tl.to(icon, { backgroundColor: '#0b3a5c', color: '#ffffff', ease: 'none', duration: 0.15 }, at)
          .to(icon, { scale: 1.15, duration: 0.1, ease: 'power2.out' }, at)
          .to(icon, { scale: 1, duration: 0.22, ease: 'power2.inOut' }, at + 0.1)
      })

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16">
      <div className="mx-auto max-w-[1200px] px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-h1 font-semibold text-text-primary">How it works</h2>
          <span
            ref={counterRef}
            className="hidden text-caption font-medium tabular-nums text-text-muted md:inline"
          >
            1 / {steps.length}
          </span>
        </div>

        <div className="relative mt-10 h-1 w-full overflow-hidden rounded-sm bg-secondary/15">
          <div ref={fillRef} className="absolute inset-y-0 left-0 w-full origin-left rounded-sm bg-primary" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.name}>
              <span
                ref={(el) => {
                  iconRefs.current[i] = el
                }}
                className="flex size-9 items-center justify-center rounded-sm bg-primary-tint text-primary transition-transform duration-150 hover:scale-110"
              >
                <step.icon size={18} />
              </span>
              <h3 className="mt-3 text-h2 font-semibold text-text-primary">{step.name}</h3>
              <p className="mt-1 text-caption text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TraceabilitySection() {
  const question = mockQuiz[0]
  return (
    <section className="py-16">
      <Reveal className="mx-auto grid max-w-[1200px] items-center gap-12 px-8 md:grid-cols-2">
        <div>
          <h2 className="text-h1 font-semibold text-text-primary">
            Every question traces back to a page and paragraph.
          </h2>
          <p className="mt-3 max-w-[60ch] text-body text-text-secondary">
            Officers can expand any question to see exactly where it came from in the source
            material. Nothing is generated from thin air, and nothing is graded without
            evidence a reviewer can check.
          </p>
        </div>
        <div className="card-lift rounded-sm border border-border bg-surface p-5">
          <p className="text-caption text-text-secondary">{question.topic}</p>
          <p className="mt-1 text-body font-medium text-text-primary">{question.prompt}</p>
          <div className="mt-3 flex items-center gap-1.5 text-caption font-medium text-primary">
            <CaretUp size={14} />
            {question.source.citation}
          </div>
          <div className="mt-2 rounded-sm border border-border bg-surface-alt px-4 py-3">
            <p className="text-caption text-text-secondary">{question.source.snippet}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function RecommendationsSection() {
  const courses = mockCourseCatalog.slice(0, 2)
  const weakest = getWeakestDimension()
  const weakOfficers = getOfficersAtLevel(weakest.id, 'weak')
  const moderateOfficers = getOfficersAtLevel(weakest.id, 'moderate')
  const assignedCounts = [weakOfficers.length + moderateOfficers.length, weakOfficers.length]

  return (
    <section className="py-16">
      <Reveal className="mx-auto grid max-w-[1200px] items-center gap-12 px-8 md:grid-cols-2">
        <div className="order-2 grid gap-4 md:order-1">
          {courses.map((course, i) => (
            <div key={course.title} className="card-lift rounded-sm border border-border bg-surface-alt p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                  {course.provider}
                </span>
                <span className="text-micro font-medium tabular-nums text-text-muted">
                  {assignedCounts[i]} officers
                </span>
              </div>
              <h3 className="mt-2 text-h2 font-semibold text-text-primary">{course.title}</h3>
              <p className="mt-1 text-caption text-text-muted">{course.format}</p>
            </div>
          ))}
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-h1 font-semibold text-text-primary">
            Gaps become a training plan, automatically.
          </h2>
          <p className="mt-3 max-w-[60ch] text-body text-text-secondary">
            The system does not just flag weak officers. It recommends the exact iGOT
            Karmayogi courses tied to each gap, and lists exactly which officers should take
            them.
          </p>
        </div>
      </Reveal>
    </section>
  )
}

const facts = [
  {
    title: 'Bilingual by design',
    body: 'Built on Noto Sans with a Devanagari companion, so every label survives translation to Hindi without a redesign.',
  },
  {
    title: 'Grounded in your material',
    body: 'Questions are drafted and verified against the document you upload, not a generic question bank.',
  },
  {
    title: 'Honest about gaps',
    body: 'When there is not enough data to score an officer, the report says so instead of guessing.',
  },
]

function ContextSection() {
  return (
    <section className="py-16">
      <Reveal className="mx-auto max-w-[1200px] px-8">
        <h2 className="text-h1 font-semibold text-text-primary">Built for how NSSTA actually works.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {facts.map((fact, i) => (
            <div key={fact.title} className={i > 0 ? 'md:border-l md:border-border md:pl-8' : ''}>
              <h3 className="text-h2 font-semibold text-text-primary">{fact.title}</h3>
              <p className="mt-2 text-body text-text-secondary">{fact.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="py-16">
      <Reveal className="mx-auto max-w-[640px] px-8 text-center">
        <h2 className="text-h1 font-semibold text-text-primary">See it work on your own material.</h2>
        <p className="mt-3 text-body text-text-secondary">
          The live demo runs entirely in this browser. No account, no setup.
        </p>
        <Link
          to="/app"
          className="mt-6 inline-flex items-center rounded-sm bg-primary px-5 py-2.5 text-body font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Try the live demo
        </Link>
      </Reveal>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="px-8 py-8">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-caption font-medium text-text-primary">MoSPI · NSSTA</p>
        <p className="mt-1 text-caption text-text-muted">
          Smart India Hackathon 2026 prototype, built for the National Statistical Systems
          Training Academy.
        </p>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="grid-texture min-h-screen bg-bg">
      <LandingHeader />
      <HeroSection />
      <StepsSection />
      <TraceabilitySection />
      <RecommendationsSection />
      <ContextSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  )
}
