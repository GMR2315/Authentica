import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ScanPage() {
  const navigate = useNavigate()
  const [scanMethod, setScanMethod] = useState('qr')
  const [tagId, setTagId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleManualInput = () => {
    if (!tagId.trim()) {
      setError('Please enter a Tag ID')
      return
    }
    setError('')
    navigate('/verify', {
      state: {
        tagId: tagId.trim(),
        scanMethod: 'manual'
      }
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setError('QR decoding not implemented. Please use Manual entry with the Tag ID.')
  }

  const startCameraScan = async () => {
    try {
      setScanning(true)
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      stopCamera()
      setError('QR decoding not implemented. Please use Manual entry with the Tag ID.')
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Failed to access camera. Please check permissions.')
    } finally {
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Product</h1>
          <p className="mt-2 text-gray-600">Scan QR code or enter Tag ID to verify authenticity</p>
        </div>

        {/* Scan Method Selector */}
        <Card className="mb-6">
          <Card.Content className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={scanMethod === 'qr' ? 'primary' : 'outline'}
                onClick={() => setScanMethod('qr')}
                className="text-sm"
                disabled={scanning}
              >
                QR Scan
              </Button>
              <Button
                variant={scanMethod === 'file' ? 'primary' : 'outline'}
                onClick={() => setScanMethod('file')}
                className="text-sm"
                disabled={scanning}
              >
                Upload
              </Button>
              <Button
                variant={scanMethod === 'manual' ? 'primary' : 'outline'}
                onClick={() => setScanMethod('manual')}
                className="text-sm"
                disabled={scanning}
              >
                Manual
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* QR Code Scanner */}
        {scanMethod === 'qr' && (
          <Card>
            <Card.Content className="p-6">
              {!scanning ? (
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Scan QR Code</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Position the QR code within the camera frame to scan
                  </p>
                  <Button onClick={startCameraScan} className="w-full">
                    Start Camera Scan
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-black rounded-lg mb-4"
                  />
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    <span>Scanning for QR code...</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={stopCamera}
                    className="mt-4"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>
        )}

        {/* File Upload */}
        {scanMethod === 'file' && (
          <Card>
            <Card.Content className="p-6">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload QR Code Image</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload an image containing the QR code
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                  className="w-full"
                >
                  {scanning ? 'Processing...' : 'Choose File'}
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Manual Input */}
        {scanMethod === 'manual' && (
          <Card>
            <Card.Content className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Tag ID</h3>
                <Input
                  label="Tag ID"
                  id="tagId"
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="e.g., TAG-001-XYZ"
                  error={error}
                  helper="Enter the Tag ID from the product label"
                />
                <Button
                  onClick={handleManualInput}
                  disabled={scanning || !tagId.trim()}
                  className="w-full mt-4"
                >
                  {scanning ? 'Verifying...' : 'Verify Product'}
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}