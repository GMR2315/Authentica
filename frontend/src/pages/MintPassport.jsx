import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import Select from '../components/Select'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MintPassport() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [passportData, setPassportData] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProducts = [
        { 
          id: '1', 
          name: 'Luxury Watch Model X', 
          tagId: '', 
          status: 'registered',
          brand: 'SwissLux',
          model: 'Model X',
          serialNumber: 'SN123456789'
        },
        { 
          id: '2', 
          name: 'Designer Handbag', 
          tagId: '', 
          status: 'registered',
          brand: 'Fashion House',
          model: 'Classic Line',
          serialNumber: 'SN987654321'
        },
        { 
          id: '3', 
          name: 'Premium Sneakers', 
          tagId: 'TAG-003-DEF', 
          status: 'minted',
          brand: 'Sport Elite',
          model: 'Ultra Pro',
          serialNumber: 'SN555555555'
        },
        { 
          id: '4', 
          name: 'Gold Diamond Ring', 
          tagId: '', 
          status: 'registered',
          brand: 'Jewelry Masters',
          model: 'Eternity',
          serialNumber: 'SN111111111'
        }
      ]
      setProducts(mockProducts.filter(p => p.status !== 'minted'))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateTagId = () => {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString().slice(-3)
    return `TAG-${timestamp}-${randomChars}`
  }

  const handleMintPassport = async () => {
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    setLoading(true)

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const product = products.find(p => p.id === selectedProduct)
      const tagId = generateTagId()
      
      const mockPassportData = {
        tagId,
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        model: product.model,
        serialNumber: product.serialNumber,
        mintedAt: new Date().toISOString(),
        nftId: `NFT-${Math.random().toString(36).substring(2, 15)}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'minted'
      }
      
      setPassportData(mockPassportData)
      
      // Generate QR code URL (mock)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tagId)}`)
      
      alert('Passport minted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Error minting passport:', error)
      alert('Error minting passport. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPassport = () => {
    if (!passportData) return
    
    // Create a text file with passport data
    const dataStr = JSON.stringify(passportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `passport-${passportData.tagId}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const printLabel = () => {
    if (!passportData) return
    
    const printWindow = window.open('', '', 'width=400,height=300')
    printWindow.document.write(`
      <html>
        <head>
          <title>Product Label</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .label { border: 2px solid #333; padding: 15px; display: inline-block; }
            .tag-id { font-size: 18px; font-weight: bold; margin: 10px 0; }
            .qr-code { margin: 10px 0; }
            .product-info { font-size: 12px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="label">
            <h3>Authentica Verified</h3>
            <div class="tag-id">${passportData.tagId}</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="product-info">
              <strong>${passportData.productName}</strong><br>
              ${passportData.brand} - ${passportData.model}<br>
              S/N: ${passportData.serialNumber}
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Minting passport...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mint Passport</h1>
        <p className="mt-2 text-gray-600">Create an NFT-based digital passport for your product</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div>
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Select Product</h2>
            </Card.Header>
            <Card.Content>
              <Select
                label="Product"
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                options={products.map(product => ({
                  value: product.id,
                  label: `${product.name} - ${product.brand} ${product.model}`
                }))}
                helper="Select a product to mint a passport for"
              />
              
              {selectedProduct && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Product Details</h4>
                  {(() => {
                    const product = products.find(p => p.id === selectedProduct)
                    return product ? (
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p><strong>Name:</strong> {product.name}</p>
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Model:</strong> {product.model}</p>
                        <p><strong>Serial Number:</strong> {product.serialNumber}</p>
                        <p><strong>Status:</strong> <StatusBadge status={product.status} /></p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={handleMintPassport}
                  disabled={!selectedProduct || loading}
                  className="w-full"
                >
                  Mint Passport
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Passport Result */}
        <div>
          {passportData ? (
            <Card>
              <Card.Header>
                <h2 className="text-lg font-semibold text-gray-900">Passport Created</h2>
              </Card.Header>
              <Card.Content>
                <div className="text-center">
                  {/* QR Code */}
                  <div className="mb-6">
                    <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Scan to verify</p>
                  </div>
                  
                  {/* Tag ID */}
                  <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Tag ID</h3>
                    <p className="text-xl font-mono font-bold text-primary-900">{passportData.tagId}</p>
                  </div>
                  
                  {/* Passport Details */}
                  <div className="text-left space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Product:</span>
                      <span className="text-sm font-medium">{passportData.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">NFT ID:</span>
                      <span className="text-sm font-mono">{passportData.nftId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Minted:</span>
                      <span className="text-sm">{new Date(passportData.mintedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <StatusBadge status={passportData.status} />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={downloadPassport}>
                      Download
                    </Button>
                    <Button variant="secondary" onClick={printLabel}>
                      Print Label
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <Card>
              <Card.Content className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4v2m0 4v2M12 7l6 6m0 0l6-6m-6 6v12m-6 0h12" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No passport created yet</h3>
                <p className="mt-1 text-sm text-gray-500">Select a product and mint a passport to see the result here</p>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}