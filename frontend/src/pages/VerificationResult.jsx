import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const STATUS_MAP = {
  AUTHENTIC: 'authentic',
  TAMPERED: 'tampered',
  FAKE: 'fake',
  BLOCKCHAIN_UNAVAILABLE: 'unavailable'
}

export default function VerificationResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [verificationData, setVerificationData] = useState(null)
  const [error, setError] = useState('')

  const { tagId, scanMethod } = location.state || {}

  useEffect(() => {
    if (!tagId) {
      navigate('/scan')
      return
    }
    performVerification(tagId)
  }, [tagId, navigate])

  const performVerification = async (tagId) => {
    try {
      setLoading(true)
      setError('')
      console.log('🔥 Calling backend verify API for:', tagId)
      const response = await api.get(`/api/verify/${encodeURIComponent(tagId)}`)
      const data = response.data
      const status = STATUS_MAP[data.status] ?? data.status?.toLowerCase() ?? 'fake'
      setVerificationData({
        status,
        tagId: data.tag_id,
        verifiedAt: data.verified_at,
        reason: data.reason,
        product: data.product
          ? {
              name: data.product.name,
              model: data.product.model,
              serial_number: data.product.serial_number,
              serialNumber: data.product.serial_number,
              brand: data.product.brand ?? null
            }
          : null,
        details: data.details || {},
        verification: { method: scanMethod || 'manual', verifiedBy: 'Authentica System' },
        alert: data.reason || (status === 'fake' ? 'This Tag ID is not found in our system. The product may be counterfeit.' : null)
      })
    } catch (err) {
      console.error('Verification error:', err)
      if (err.response?.status === 404) {
        setError('Tag not found.')
      } else if (err.request) {
        setError('Server unavailable.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'authentic':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'tampered':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'fake':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'unavailable':
        return (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'authentic':
        return 'This product is verified authentic'
      case 'tampered':
        return 'Warning: Signs of tampering detected'
      case 'fake':
        return 'Alert: Product appears to be counterfeit'
      case 'unavailable':
        return 'Blockchain unavailable. Please try again later.'
      default:
        return 'Verification completed'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying product...</p>
        </div>
      </div>
    )
  }

  if (error || !verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <Card.Content className="text-center p-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to verify product'}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/scan')} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Status Header */}
        <Card className="mb-8">
          <Card.Content className="text-center p-8">
            {getStatusIcon(verificationData.status)}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Result
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {getStatusMessage(verificationData.status)}
            </p>
            <StatusBadge status={verificationData.status} className="text-lg px-4 py-2" />
            
            {verificationData.alert && (
              <div className={`mt-4 p-4 rounded-lg ${
                verificationData.status === 'fake' ? 'bg-red-50 border border-red-200' : verificationData.status === 'unavailable' ? 'bg-gray-50 border border-gray-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm ${
                  verificationData.status === 'fake' ? 'text-red-800' : verificationData.status === 'unavailable' ? 'text-gray-800' : 'text-yellow-800'
                }`}>
                  {verificationData.alert}
                </p>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Product Details */}
        {verificationData.product && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium text-gray-900">{verificationData.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium text-gray-900">{verificationData.product.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium text-gray-900">{verificationData.product.serialNumber ?? verificationData.product.serial_number}</p>
                </div>
                {verificationData.product.brand != null && verificationData.product.brand !== '' && (
                  <div>
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium text-gray-900">{verificationData.product.brand}</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Verified Lifecycle (read-only, when AUTHENTIC) */}
        {verificationData.status === 'authentic' && (verificationData.history?.length > 0 || verificationData.details?.minted_at || verificationData.verifiedAt) && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Verified Lifecycle</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {verificationData.history?.length > 0
                  ? verificationData.history.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900">{event.event}</p>
                            <p className="text-sm text-gray-500">
                              {event.date ? new Date(event.date).toLocaleDateString() : '—'}
                            </p>
                          </div>
                          {event.location && <p className="text-sm text-gray-600">{event.location}</p>}
                        </div>
                      </div>
                    ))
                  : [
                      verificationData.details?.minted_at && {
                        event: 'Passport minted',
                        date: verificationData.details.minted_at,
                        location: 'Blockchain',
                      },
                      verificationData.verifiedAt && {
                        event: 'Verified',
                        date: verificationData.verifiedAt,
                        location: 'Authentica',
                      },
                    ]
                      .filter(Boolean)
                      .map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900">{event.event}</p>
                              <p className="text-sm text-gray-500">
                                {event.date ? new Date(event.date).toLocaleString() : '—'}
                              </p>
                            </div>
                            {event.location && <p className="text-sm text-gray-600">{event.location}</p>}
                          </div>
                        </div>
                      ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Blockchain Info */}
        {verificationData.passport && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Blockchain Information</h2>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Tag ID</p>
                  <p className="font-mono text-gray-900">{verificationData.tagId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NFT ID</p>
                  <p className="font-mono text-gray-900">{verificationData.passport.nftId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Minted At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(verificationData.passport.mintedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <p className="font-mono text-gray-900 text-sm">{verificationData.passport.transactionHash}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Verification Details */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Verification Details</h2>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Verification Method</p>
                <p className="font-medium text-gray-900 capitalize">{verificationData.verification?.method ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified At</p>
                <p className="font-medium text-gray-900">
                  {verificationData.verifiedAt ? new Date(verificationData.verifiedAt).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified By</p>
                <p className="font-medium text-gray-900">{verificationData.verification?.verifiedBy ?? '—'}</p>
              </div>
            </div>

            {verificationData.verification?.issues && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">Issues Detected:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {verificationData.verification.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* History */}
        {verificationData.history && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Product History</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {verificationData.history.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900">{event.event}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/scan')} className="flex-1 sm:flex-none">
            Verify Another Product
          </Button>
          {verificationData.status === 'authentic' && (
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="flex-1 sm:flex-none"
            >
              Print Certificate
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1 sm:flex-none">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}