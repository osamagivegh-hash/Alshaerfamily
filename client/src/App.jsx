import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminProvider } from './contexts/AdminContext'

// Public Components
import PublicApp from './components/PublicApp'

// Admin Components
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminNews from './components/admin/AdminNews'
import AdminConversations from './components/admin/AdminConversations'
import AdminArticles from './components/admin/AdminArticles'
import AdminPalestine from './components/admin/AdminPalestine'
import AdminGallery from './components/admin/AdminGallery'
import AdminFamilyTree from './components/admin/AdminFamilyTree'
import AdminContacts from './components/admin/AdminContacts'
import AdminSettings from './components/admin/AdminSettings'
import ProtectedRoute from './components/admin/ProtectedRoute'

function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="min-h-screen bg-palestine-white">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicApp />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="conversations" element={<AdminConversations />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="palestine" element={<AdminPalestine />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="family-tree" element={<AdminFamilyTree />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl'
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#007A3D',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#CE1126',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AdminProvider>
  )
}

export default App
