import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    authenticProducts: 0,
    tamperedProducts: 0,
    fakeProducts: 0,
    pendingVerifications: 0
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data
      setTimeout(() => {
        setStats({
          totalProducts: 1247,
          authenticProducts: 1198,
          tamperedProducts: 31,
          fakeProducts: 18,
          pendingVerifications: 12
        })
        
        setRecentProducts([
          {
            id: '1',
            name: 'Luxury Watch Model X',
            tagId: 'TAG-001-XYZ',
            status: 'authentic',
            createdAt: '2024-01-27T10:30:00Z'
          },
          {
            id: '2', 
            name: 'Designer Handbag',
            tagId: 'TAG-002-ABC',
            status: 'tampered',
            createdAt: '2024-01-27T09:15:00Z'
          },
          {
            id: '3',
            name: 'Premium Sneakers',
            tagId: 'TAG-003-DEF',
            status: 'pending',
            createdAt: '2024-01-27T08:45:00Z'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your product verification system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.authenticProducts}</div>
          <div className="text-sm text-gray-500">Authentic</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.tamperedProducts}</div>
          <div className="text-sm text-gray-500">Tampered</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.fakeProducts}</div>
          <div className="text-sm text-gray-500">Fake</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.pendingVerifications}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.tagId}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={product.status} />
                    <div className="text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Link
                to="/admin/register-product"
                className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Register New Product</div>
                <div className="text-sm text-gray-500">Add a new product to the system</div>
              </Link>
              
              <Link
                to="/admin/upload-assets"
                className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Upload Assets</div>
                <div className="text-sm text-gray-500">Upload images and documents</div>
              </Link>
              
              <Link
                to="/admin/mint-passport"
                className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Mint Passport</div>
                <div className="text-sm text-gray-500">Create NFT passport for product</div>
              </Link>
              
              <Link
                to="/scan"
                className="block w-full text-left px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="font-medium text-primary-900">Scan Product</div>
                <div className="text-sm text-primary-700">Verify a product's authenticity</div>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}