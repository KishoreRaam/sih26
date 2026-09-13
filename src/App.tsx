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
