import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminAuth } from '../utils/adminApi'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (adminAuth.isAuthenticated()) {
          await adminAuth.verifyToken()
          const currentUser = adminAuth.getCurrentUser()
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        adminAuth.logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await adminAuth.login(credentials)
      setUser(response.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    adminAuth.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const changePassword = async (passwordData) => {
    try {
      return await adminAuth.changePassword(passwordData)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext
