import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * Family Tree Auth Context
 * 
 * COMPLETELY SEPARATE from CMS AdminContext.
 * Uses its own:
 * - Token storage (familyTreeToken)
 * - API endpoints (/api/family-tree-auth/*)
 * - User state
 * 
 * SECURITY: No shared state with CMS authentication.
 */

const FamilyTreeAuthContext = createContext(null)

// Storage key - different from CMS
const FT_TOKEN_KEY = 'familyTreeToken'
const FT_USER_KEY = 'familyTreeUser'

export const FamilyTreeAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // API base URL - empty string in production (relative URLs), localhost in development
    const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : ''

    // Get stored token
    const getToken = useCallback(() => {
        return localStorage.getItem(FT_TOKEN_KEY)
    }, [])

    // Store token and user
    const storeAuth = useCallback((token, userData) => {
        localStorage.setItem(FT_TOKEN_KEY, token)
        localStorage.setItem(FT_USER_KEY, JSON.stringify(userData))
        setUser(userData)
    }, [])

    // Clear auth
    const clearAuth = useCallback(() => {
        localStorage.removeItem(FT_TOKEN_KEY)
        localStorage.removeItem(FT_USER_KEY)
        setUser(null)
    }, [])

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            const token = getToken()

            if (!token) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`${API_BASE}/api/family-tree-auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.user) {
                        setUser(data.user)
                    } else {
                        clearAuth()
                    }
                } else {
                    clearAuth()
                }
            } catch (err) {
                console.error('[FT-AUTH] Token verification failed:', err)
                clearAuth()
            } finally {
                setLoading(false)
            }
        }

        verifyToken()
    }, [API_BASE, getToken, clearAuth])

    // Login function
    const login = async (username, password) => {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE}/api/family-tree-auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                storeAuth(data.token, data.user)
                return { success: true }
            } else {
                setError(data.message || 'فشل تسجيل الدخول')
                return { success: false, message: data.message }
            }
        } catch (err) {
            console.error('[FT-AUTH] Login error:', err)
            setError('خطأ في الاتصال بالخادم')
            return { success: false, message: 'خطأ في الاتصال بالخادم' }
        } finally {
            setLoading(false)
        }
    }

    // Logout function
    const logout = async () => {
        const token = getToken()

        if (token) {
            try {
                await fetch(`${API_BASE}/api/family-tree-auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            } catch (err) {
                console.error('[FT-AUTH] Logout error:', err)
            }
        }

        clearAuth()
    }

    // Check if user is FT Super Admin
    const isFTSuperAdmin = user?.role === 'ft-super-admin'

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (!user) return false
        if (user.role === 'ft-super-admin') return true
        return user.permissions?.includes(permission) || false
    }

    // Get auth header for API calls
    const getAuthHeader = () => {
        const token = getToken()
        return token ? { 'Authorization': `Bearer ${token}` } : {}
    }

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isFTSuperAdmin,
        login,
        logout,
        hasPermission,
        getToken,
        getAuthHeader
    }

    return (
        <FamilyTreeAuthContext.Provider value={value}>
            {children}
        </FamilyTreeAuthContext.Provider>
    )
}

// Hook to use FT auth context
export const useFamilyTreeAuth = () => {
    const context = useContext(FamilyTreeAuthContext)
    if (!context) {
        throw new Error('useFamilyTreeAuth must be used within FamilyTreeAuthProvider')
    }
    return context
}

export default FamilyTreeAuthContext
