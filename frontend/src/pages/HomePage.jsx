import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

function ShieldIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-900 font-semibold text-lg hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            <ShieldIcon className="w-6 h-6 text-primary-600" />
            <span>Authentica</span>
          </button>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button size="sm" onClick={() => navigate('/scan')}>
              Scan
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/login')}>
              Admin Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero — add top padding so content is not hidden under fixed header */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Blockchain-Backed Product Authentication
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Secure digital passports. Instant verification. Counterfeit prevention.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/scan')}
              className="w-full sm:w-auto px-8"
            >
              Scan Product
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/login')}
              className="w-full sm:w-auto px-8"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="border-t border-gray-200 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Product Registered & Minted</h3>
              <p className="mt-2 text-sm text-gray-600">
                Manufacturers register products and mint NFT passports on-chain for tamper-proof records.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Secure QR Tag Issued</h3>
              <p className="mt-2 text-sm text-gray-600">
                Each product receives a unique QR tag linked to its blockchain passport.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Scan to Verify Authenticity</h3>
              <p className="mt-2 text-sm text-gray-600">
                Consumers scan the tag to instantly verify authenticity and view the product lifecycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-4 text-center text-sm text-gray-500">
        <p>© 2026 Authentica</p>
        <p className="mt-1">Academic Blockchain Authentication System</p>
      </footer>
    </div>
  )
}
