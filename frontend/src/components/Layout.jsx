import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdminRoute && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">Authentica</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === '/admin'
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/register-product"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === '/admin/register-product'
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Register Product
                  </Link>
                  <Link
                    to="/admin/upload-assets"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === '/admin/upload-assets'
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Upload Assets
                  </Link>
                  <Link
                    to="/admin/mint-passport"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === '/admin/mint-passport'
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Mint Passport
                  </Link>
                  <Link
                    to="/admin/provenance"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === '/admin/provenance'
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Provenance
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/scan"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Scan Product
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={isAdminRoute ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' : ''}>
        {children}
      </main>
    </div>
  )
}