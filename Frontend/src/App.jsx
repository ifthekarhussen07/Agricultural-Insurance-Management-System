import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ComponentPreview from './pages/ComponentPreview'
import HomePage from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/welcome" element={<HomePage />} />

        {/* Dashboard layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<ComponentPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
