import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AUTH_TOKEN_KEY = 'authToken'

/**
 * Protects admin routes. If no JWT in localStorage, redirects to /admin/login.
 * Preserves intended destination in location state for post-login redirect (optional).
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
