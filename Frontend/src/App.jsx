import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ComponentPreview from './pages/ComponentPreview'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/welcome" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<ComponentPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
