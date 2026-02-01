import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
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
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/register-product" element={<ProductRegistration />} />
          <Route path="/admin/upload-assets" element={<AssetsUpload />} />
          <Route path="/admin/mint-passport" element={<MintPassport />} />
          <Route path="/admin/provenance" element={<ProvenanceTimeline />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/verify" element={<VerificationResult />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
