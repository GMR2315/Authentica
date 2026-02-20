import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import api from '../services/api'

const AUTH_TOKEN_KEY = 'authToken'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/admin/login', { username, password })
      const token = response.data?.token ?? response.data?.accessToken
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
        navigate(from || '/admin/dashboard', { replace: true })
      } else {
        setError('Invalid response from server.')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.request) {
        setError('Server unavailable. Please try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Authentica Admin</h1>
          <p className="mt-2 text-gray-600">Sign in to manage products and passports</p>
        </div>
        <Card padding="none">
          <Card.Content className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
              />
              <Input
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </Card.Content>
        </Card>
        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </p>
      </div>
    </div>
  )
}
