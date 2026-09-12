import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DiagnosticsApp } from './pages/DiagnosticsApp'
import { LandingPage } from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<DiagnosticsApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
