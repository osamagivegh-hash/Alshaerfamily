import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useFamilyTreeAuth } from '../../contexts/FamilyTreeAuthContext'

/**
 * Family Tree Protected Route
 * 
 * COMPLETELY SEPARATE from CMS ProtectedRoute.
 * Uses FamilyTreeAuthContext for authentication check.
 * 
 * SECURITY: CMS tokens will NOT work with this route.
 * Users must be authenticated via Family Tree login.
 */
const FamilyTreeProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useFamilyTreeAuth()
    const location = useLocation()

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-5xl mb-4">🌳</div>
                    <p className="text-emerald-600 font-medium">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        )
    }

    // Not authenticated - redirect to FT login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/family-dashboard/login"
                state={{ from: location }}
                replace
            />
        )
    }

    // Authenticated - render children
    return children
}

export default FamilyTreeProtectedRoute
