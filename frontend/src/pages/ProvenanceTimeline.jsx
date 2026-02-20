import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Select from '../components/Select'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import api, { productAPI } from '../services/api'

const demoLifecycleTemplate = [
  {
    id: 'QC',
    title: 'Quality Control Passed',
    description: 'Final inspection and testing completed',
    actor: 'SwissLux Quality Team',
    location: 'Geneva, Switzerland',
    batchId: 'BATCH-001',
    materials: 'Stainless Steel, Sapphire Crystal, Swiss Movement',
    qualityScore: '98.5%',
    status: 'completed',
    isVerified: false
  },
  {
    id: 'DISTRIBUTED',
    title: 'Shipped to Distributor',
    description: 'Transferred to European distribution hub',
    actor: 'Global Logistics AG',
    location: 'Zurich, Switzerland',
    status: 'completed',
    isVerified: false
  },
  {
    id: 'RETAIL',
    title: 'Retail Stocked',
    description: 'Product available at flagship store',
    actor: 'Luxury Retail Partner',
    location: 'Paris, France',
    status: 'completed',
    isVerified: false
  },
  {
    id: 'PURCHASED',
    title: 'Purchased by Customer',
    description: 'Product sold to end customer',
    actor: 'Authorized Retailer',
    location: 'Paris, France',
    status: 'completed',
    isVerified: false
  }
]

export default function ProvenanceTimeline() {
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [products, setProducts] = useState([])
  const [realEvents, setRealEvents] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchTimeline(selectedProduct)
    } else {
      setRealEvents([])
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll()
      const list = res.data ?? []
      setProducts(Array.isArray(list) ? list : [])
      if (list?.length > 0 && !selectedProduct) {
        setSelectedProduct(list[0].product_id)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async (productId) => {
    setTimelineLoading(true)
    try {
      const response = await api.get(`/api/admin/products/${productId}`)
      const product = response.data
      const provenance = product?.provenance
      if (Array.isArray(provenance) && provenance.length > 0) {
        const mapped = provenance.map((e) => ({
          id: e.event_id,
          title: e.event_type || 'Event',
          description: e.event_description || '',
          timestamp: e.event_time,
          isVerified: true,
          status: 'completed'
        }))
        setRealEvents(mapped)
      } else {
        setRealEvents([])
      }
    } catch (err) {
      setRealEvents([])
    } finally {
      setTimelineLoading(false)
    }
  }

  const getEventIcon = (isVerified) => {
    if (isVerified) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 'Simulated') return timestamp || '—'
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return String(timestamp)
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
              value: product.product_id,
              label: `${product.name} (${product.serial_number})`
            }))}
          />
        </div>
      </div>

      {timelineLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!timelineLoading && (
        <div className="space-y-10">
          {/* Section 1: Verified On-Chain Provenance */}
          <div className="relative">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">🔐 Verified On-Chain Provenance</h2>
            <p className="text-sm text-gray-600 mb-6">Blockchain-backed lifecycle events</p>
            {realEvents.length === 0 ? (
              <Card>
                <Card.Content className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No verified provenance events recorded yet.</h3>
                  <p className="mt-1 text-sm text-gray-500">Mint a passport to auto-create verified events, or add events via the backend.</p>
                </Card.Content>
              </Card>
            ) : (
              <div className="space-y-6">
                {realEvents.map((event, index) => (
                  <div key={event.id} className="relative flex items-start">
                    {index < realEvents.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="flex-shrink-0 w-12 h-12 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center z-10">
                      {getEventIcon(true)}
                    </div>
                    <div className="ml-6 flex-1">
                      <Card className="border-green-200">
                        <Card.Content className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              On-Chain Verified
                            </span>
                            {event.status && <StatusBadge status={event.status} />}
                          </div>
                          {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}
                          <div className="text-sm">
                            <span className="text-gray-500">Time: </span>
                            <span className="text-gray-900">{formatDate(event.timestamp)}</span>
                          </div>
                        </Card.Content>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Full Supply Chain Lifecycle (Demo) - always shown */}
          <div className="relative pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">📦 Full Supply Chain Lifecycle (Demo)</h2>
            <p className="text-sm text-gray-600 mb-6">This section illustrates full lifecycle tracking capability for academic demonstration purposes. Simulated events are not stored on-chain.</p>
            <div className="space-y-6">
              {demoLifecycleTemplate.map((event, index) => (
                <div key={event.id} className="relative flex items-start">
                  {index < demoLifecycleTemplate.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                  )}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 border-2 border-gray-200 rounded-full flex items-center justify-center z-10">
                    {getEventIcon(false)}
                  </div>
                  <div className="ml-6 flex-1">
                    <Card className="border-gray-200 bg-gray-50/50">
                      <Card.Content className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Simulated Event
                          </span>
                          {event.status && <StatusBadge status={event.status} />}
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {event.actor && (
                            <div>
                              <span className="text-gray-500">Actor:</span>
                              <span className="ml-2 text-gray-900">{event.actor}</span>
                            </div>
                          )}
                          {event.location && (
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-2 text-gray-900">{event.location}</span>
                            </div>
                          )}
                          {event.batchId && (
                            <div>
                              <span className="text-gray-500">Batch ID:</span>
                              <span className="ml-2 text-gray-900">{event.batchId}</span>
                            </div>
                          )}
                          {event.materials && (
                            <div>
                              <span className="text-gray-500">Materials:</span>
                              <span className="ml-2 text-gray-900">{event.materials}</span>
                            </div>
                          )}
                          {event.qualityScore && (
                            <div>
                              <span className="text-gray-500">Quality Score:</span>
                              <span className="ml-2 text-gray-900">{event.qualityScore}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <span className="ml-2 text-gray-500">Simulated</span>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}