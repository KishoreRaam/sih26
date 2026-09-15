import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { AdminCohortOverview } from '../components/admin/AdminCohortOverview'
import { CourseProgressBoard } from '../components/admin/CourseProgressBoard'
import { DepartmentOfficerList } from '../components/admin/DepartmentOfficerList'
import { OfficerProfile } from '../components/admin/OfficerProfile'
import { RejectionAuditBoard } from '../components/admin/RejectionAuditBoard'
import { DashboardScreen } from '../components/screens/DashboardScreen'
import { FracTaxonomyExplorer } from '../components/screens/FracTaxonomyExplorer'
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

type Section =
  | 'overview'
  | 'fracTaxonomy'
  | 'diagnostics'
  | 'officers'
  | 'reports'
  | 'settings'
  | 'audit'
  | 'courseProgress'

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
      if (id === 'overview') setOverviewView({ kind: 'departments' })
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
        {section === 'fracTaxonomy' && <FracTaxonomyExplorer />}
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
