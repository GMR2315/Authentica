import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProductRegistration from './pages/ProductRegistration'
import AssetsUpload from './pages/AssetsUpload'
import MintPassport from './pages/MintPassport'
import ProvenanceTimeline from './pages/ProvenanceTimeline'
import ScanPage from './pages/ScanPage'
import VerificationResult from './pages/VerificationResult'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/verify" element={<VerificationResult />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="register-product" element={<ProductRegistration />} />
          <Route path="upload-assets" element={<AssetsUpload />} />
          <Route path="mint-passport" element={<MintPassport />} />
          <Route path="provenance" element={<ProvenanceTimeline />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
