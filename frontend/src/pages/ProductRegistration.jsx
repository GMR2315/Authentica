import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import LoadingSpinner from '../components/LoadingSpinner'
import { productAPI } from '../services/api'

export default function ProductRegistration() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    description: '',
    manufacturingDate: '',
    manufacturingLocation: '',
    materials: '',
    weight: '',
    dimensions: '',
    color: '',
    specialFeatures: '',
    retailPrice: '',
    warrantyPeriod: '',
    tags: ''
  })
  
  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Accessories' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'art', label: 'Art & Collectibles' },
    { value: 'luxury', label: 'Luxury Goods' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required'
    if (!formData.model.trim()) newErrors.model = 'Model is required'
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required'
    if (!formData.manufacturingDate) newErrors.manufacturingDate = 'Manufacturing date is required'
    if (!formData.manufacturingLocation.trim()) newErrors.manufacturingLocation = 'Manufacturing location is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setApiError('')
    setSuccessMessage('')

    const body = {
      name: formData.name.trim(),
      model: formData.model.trim(),
      serial_number: formData.serialNumber.trim(),
      description: formData.description != null ? formData.description.trim() || null : null
    }

    try {
      const response = await productAPI.create(body)
      if (response.status === 201 && response.data) {
        const productId = response.data.product_id
        if (productId) {
          console.log('Product registered. product_id:', productId)
          setSuccessMessage(`Product registered successfully. Product ID: ${productId}`)
        } else {
          setSuccessMessage('Product registered successfully.')
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setApiError('Serial number already exists.')
      } else if (error.response?.status === 400 && error.response?.data?.error) {
        setApiError(error.response.data.error)
      } else if (error.request) {
        setApiError('Network error. Please check the connection and try again.')
      } else {
        setApiError('Error registering product. Please try again.')
      }
    } finally {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Register New Product</h1>
        <p className="mt-2 text-gray-600">Add a new product to the verification system</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {successMessage}
        </div>
      )}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {apiError}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />
              
              <Select
                label="Category"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                error={errors.category}
                required
              />
              
              <Input
                label="Brand"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                error={errors.brand}
                required
              />
              
              <Input
                label="Model"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                error={errors.model}
                required
              />
              
              <Input
                label="Serial Number"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                error={errors.serialNumber}
                required
              />
              
              <Input
                label="Manufacturing Date"
                id="manufacturingDate"
                name="manufacturingDate"
                type="date"
                value={formData.manufacturingDate}
                onChange={handleInputChange}
                error={errors.manufacturingDate}
                required
              />
            </div>
            
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Manufacturing Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manufacturing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Manufacturing Location"
                id="manufacturingLocation"
                name="manufacturingLocation"
                value={formData.manufacturingLocation}
                onChange={handleInputChange}
                error={errors.manufacturingLocation}
                required
              />
              
              <Input
                label="Materials"
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                helper="e.g., Gold, Leather, Stainless Steel"
              />
              
              <Input
                label="Weight (grams)"
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
              />
              
              <Input
                label="Dimensions (L x W x H)"
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                helper="e.g., 10 x 5 x 2 cm"
              />
            </div>
          </div>

          {/* Product Attributes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
              
              <Input
                label="Special Features"
                id="specialFeatures"
                name="specialFeatures"
                value={formData.specialFeatures}
                onChange={handleInputChange}
              />
              
              <Input
                label="Retail Price ($)"
                id="retailPrice"
                name="retailPrice"
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={handleInputChange}
              />
              
              <Input
                label="Warranty Period"
                id="warrantyPeriod"
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleInputChange}
                helper="e.g., 2 years, Lifetime"
              />
            </div>
            
            <div className="mt-6">
              <Input
                label="Tags"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                helper="Comma-separated tags for search and filtering"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}