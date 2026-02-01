import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import Select from '../components/Select'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProvenanceTimeline() {
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [products, setProducts] = useState([])
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchTimeline(selectedProduct)
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProducts = [
        { id: '1', name: 'Luxury Watch Model X', tagId: 'TAG-001-XYZ' },
        { id: '2', name: 'Designer Handbag', tagId: 'TAG-002-ABC' },
        { id: '3', name: 'Premium Sneakers', tagId: 'TAG-003-DEF' },
        { id: '4', name: 'Gold Diamond Ring', tagId: 'TAG-004-GHI' }
      ]
      setProducts(mockProducts)
      if (mockProducts.length > 0) {
        setSelectedProduct(mockProducts[0].id)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async (productId) => {
    try {
      // Mock timeline data - replace with actual API call
      const mockTimeline = [
        {
          id: '1',
          type: 'manufacturing',
          title: 'Product Manufactured',
          description: 'Product created at SwissLux facility',
          location: 'Geneva, Switzerland',
          timestamp: '2024-01-15T08:00:00Z',
          actor: 'SwissLux Manufacturing',
          status: 'completed',
          metadata: {
            batchId: 'BATCH-001',
            qualityScore: '98.5%',
            materials: ['Stainless Steel', 'Sapphire Crystal', 'Swiss Movement']
          }
        },
        {
          id: '2',
          type: 'quality_check',
          title: 'Quality Control Passed',
          description: 'Product passed all quality control tests',
          location: 'Geneva, Switzerland',
          timestamp: '2024-01-15T10:30:00Z',
          actor: 'Quality Control Team',
          status: 'completed',
          metadata: {
            tests: ['Water Resistance', 'Time Accuracy', 'Durability'],
            inspector: 'John Smith',
            certificate: 'QC-2024-001'
          }
        },
        {
          id: '3',
          type: 'blockchain',
          title: 'Digital Passport Minted',
          description: 'NFT passport created on blockchain',
          location: 'Ethereum Network',
          timestamp: '2024-01-16T14:00:00Z',
          actor: 'Authentica System',
          status: 'completed',
          metadata: {
            nftId: 'NFT-12345',
            transactionHash: '0xabc123...',
            blockNumber: '18500000'
          }
        },
        {
          id: '4',
          type: 'shipping',
          title: 'Product Shipped',
          description: 'Product shipped to authorized retailer',
          location: 'Zurich, Switzerland',
          timestamp: '2024-01-17T09:00:00Z',
          actor: 'SwissLux Logistics',
          status: 'completed',
          metadata: {
            trackingNumber: 'TRK-789012',
            carrier: 'FedEx',
            destination: 'Luxury Watches Store'
          }
        },
        {
          id: '5',
          type: 'retail',
          title: 'Product Sold',
          description: 'Product sold to end customer',
          location: 'Zurich, Switzerland',
          timestamp: '2024-01-20T16:30:00Z',
          actor: 'Luxury Watches Store',
          status: 'completed',
          metadata: {
            customerId: 'CUST-456',
            salesAssociate: 'Maria Garcia',
            warrantyRegistered: true
          }
        },
        {
          id: '6',
          type: 'verification',
          title: 'Authenticity Verified',
          description: 'Product authenticity verified by customer',
          location: 'Online',
          timestamp: '2024-01-25T11:15:00Z',
          actor: 'Customer',
          status: 'completed',
          metadata: {
            verificationMethod: 'QR Scan',
            result: 'Authentic',
            confidence: '100%'
          }
        }
      ]
      setTimeline(mockTimeline)
    } catch (error) {
      console.error('Error fetching timeline:', error)
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'manufacturing':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      case 'quality_check':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'blockchain':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'shipping':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      case 'retail':
        return (
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      case 'verification':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Provenance Timeline</h1>
        <p className="mt-2 text-gray-600">Track the complete journey and history of your products</p>
      </div>

      {/* Product Selector */}
      <div className="mb-8">
        <div className="max-w-md">
          <Select
            label="Select Product"
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            options={products.map(product => ({
              value: product.id,
              label: `${product.name} (${product.tagId})`
            }))}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {timeline.length === 0 ? (
          <Card>
            <Card.Content className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline data available</h3>
              <p className="mt-1 text-sm text-gray-500">Select a product to view its provenance timeline</p>
            </Card.Content>
          </Card>
        ) : (
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex items-start">
                {/* Timeline Line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                )}
                
                {/* Event Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event Content */}
                <div className="ml-6 flex-1">
                  <Card>
                    <Card.Content className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <StatusBadge status={event.status} />
                          </div>
                          
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-2 text-gray-900">{event.location}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Actor:</span>
                              <span className="ml-2 text-gray-900">{event.actor}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <span className="ml-2 text-gray-900">{formatDate(event.timestamp)}</span>
                            </div>
                          </div>
                          
                          {/* Metadata */}
                          {event.metadata && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {Object.entries(event.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className="ml-2 text-gray-900">
                                      {Array.isArray(value) ? value.join(', ') : value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}