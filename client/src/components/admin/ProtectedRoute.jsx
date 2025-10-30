import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import LoadingSpinner from '../LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
