import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import InvoicePreview from './pages/InvoicePreview'
import BusinessProfile from './pages/BusinessProfile'
import AppShell from './components/AppShell'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/" replace />
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/invoices/new" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
        <Route path="/invoices/:id/edit" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><InvoicePreview /></ProtectedRoute>} />
        <Route path="/business-profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
