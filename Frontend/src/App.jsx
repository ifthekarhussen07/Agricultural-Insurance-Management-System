import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FarmerDashboard from './pages/FarmerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PoliciesPage from './pages/PoliciesPage'
import SubmitClaimPage from './pages/SubmitClaimPage'
import ClaimsPage from './pages/ClaimsPage'
import ComponentPreview from './pages/ComponentPreview'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/welcome" element={<HomePage />} />

        {/* Guest-only (redirect if already logged in) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Farmer-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
          <Route element={<AppLayout />}>
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/submit-claim" element={<SubmitClaimPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Shared authenticated routes (Farmer + Admin) */}
        <Route element={<ProtectedRoute allowedRoles={['Farmer', 'Admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
          </Route>
        </Route>

        {/* Dev preview (protected, any role) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/preview" element={<ComponentPreview />} />
          </Route>
        </Route>

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
