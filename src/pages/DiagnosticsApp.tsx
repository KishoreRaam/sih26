import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { DashboardScreen } from '../components/screens/DashboardScreen'
import { GenerateScreen } from '../components/screens/GenerateScreen'
import { OfficersScreen } from '../components/screens/OfficersScreen'
import { OverviewScreen } from '../components/screens/OverviewScreen'
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

type Section = 'overview' | 'diagnostics' | 'officers' | 'reports' | 'settings'

export function DiagnosticsApp() {
  const [section, setSection] = useState<Section>('diagnostics')
  const [step, setStep] = useState<Step>('upload')

  const goToDiagnostics = (targetStep: Step) => {
    setSection('diagnostics')
    setStep(targetStep)
  }

  const breadcrumb = section === 'diagnostics' ? breadcrumbByStep[step] : breadcrumbBySection[section]
  const title = section === 'diagnostics' ? stepCopy[step].title : sectionCopy[section].title
  const subtitle =
    section === 'diagnostics' ? stepCopy[step].subtitle : sectionCopy[section].subtitle

  return (
    <AppShell
      breadcrumb={breadcrumb}
      activeNavId={section}
      onNavSelect={(id) => setSection(id as Section)}
    >
      <h1 className="text-title font-semibold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">{subtitle}</p>

      <div className="mt-8">
        {section === 'overview' && (
          <OverviewScreen
            onStart={() => goToDiagnostics('upload')}
            onViewReport={() => goToDiagnostics('dashboard')}
          />
        )}
        {section === 'officers' && <OfficersScreen />}
        {section === 'reports' && (
          <ReportsScreen onViewReport={() => goToDiagnostics('dashboard')} />
        )}
        {section === 'settings' && <SettingsScreen />}

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
