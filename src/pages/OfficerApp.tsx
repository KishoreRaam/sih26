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
