import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import api, { productAPI } from '../services/api'

export default function AssetsUpload() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll()
        if (!cancelled && response?.data) {
          setProducts(Array.isArray(response.data) ? response.data : [])
          if (response.data?.length > 0 && !selectedProductId) {
            setSelectedProductId(response.data[0].product_id)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([])
          setUploadMessage({ type: 'error', text: 'Failed to load products.' })
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    }))

    // Generate preview for images
    newFiles.forEach(fileObj => {
      if (fileObj.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          fileObj.preview = reader.result
          setSelectedFiles(prev => [...prev, fileObj])
        }
        reader.readAsDataURL(fileObj.file)
      } else {
        setSelectedFiles(prev => [...prev, fileObj])
      }
    })
  }

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    } else if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadMessage({ type: 'error', text: 'Please select files to upload.' })
      return
    }
    if (!selectedProductId) {
      setUploadMessage({ type: 'error', text: 'Please select a product.' })
      return
    }

    setUploading(true)
    setUploadMessage({ type: '', text: '' })

    const formData = new FormData()
    selectedFiles.forEach((f) => formData.append('files', f.file))

    try {
      const response = await api.post(
        `/api/admin/products/${selectedProductId}/assets`,
        formData
      )
      if (response.status === 200) {
        const count = response.data?.uploads?.length ?? selectedFiles.length
        setUploadMessage({ type: 'success', text: `${count} file(s) uploaded successfully.` })
        setUploadedFiles(prev => [...prev, ...selectedFiles])
        setSelectedFiles([])
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setUploadMessage({ type: 'error', text: error.response?.data?.error || 'Product not found.' })
      } else if (error.response?.status === 400) {
        setUploadMessage({ type: 'error', text: error.response?.data?.error || 'Invalid request.' })
      } else {
        setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' })
      }
    } finally {
      setUploading(false)
    }
  }

  if (productsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Uploading files...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Assets</h1>
        <p className="mt-2 text-gray-600">Upload images, documents, and other assets for your products</p>
      </div>

      {uploadMessage.text && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${
          uploadMessage.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {uploadMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Upload Files</h2>
            </Card.Header>
            <Card.Content>
              {/* Product selector */}
              <div className="mb-6">
                <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  id="product-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.name} ({p.serial_number})
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">No products yet. Register a product first.</p>
                )}
              </div>
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M24 8v24m-10-10h20" />
                </svg>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or{' '}
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: Images (JPG, PNG, GIF), Documents (PDF, DOC, DOCX)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          getFileIcon(file.type)
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleUpload}>
                      Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Uploaded Files */}
        <div>
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Recently Uploaded</h2>
            </Card.Header>
            <Card.Content>
              {uploadedFiles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  )
}