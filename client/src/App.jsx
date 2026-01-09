import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminProvider } from './contexts/AdminContext'

// Public Components
import PublicApp from './components/PublicApp'
import ArticleDetail from './components/ArticleDetail'
import ConversationDetail from './components/ConversationDetail'
import NewsDetail from './components/NewsDetail'
import NotFound from './components/common/NotFound'
import ScrollToTop from './components/common/ScrollToTop'
import ArchivePage from './pages/Archive'
import FamilyTreePage from './pages/FamilyTreePage'

// Admin Components
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminNews from './components/admin/AdminNews'
import AdminConversations from './components/admin/AdminConversations'
import AdminArticles from './components/admin/AdminArticles'
import AdminPalestine from './components/admin/AdminPalestine'
import AdminGallery from './components/admin/AdminGallery'
import AdminComments from './components/admin/AdminComments'
import AdminContacts from './components/admin/AdminContacts'
import AdminSettings from './components/admin/AdminSettings'
import AdminTickers from './components/admin/AdminTickers'
import AdminFamilyTree from './components/admin/AdminFamilyTree'
import ProtectedRoute from './components/admin/ProtectedRoute'

function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="min-h-screen bg-palestine-white">
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicApp />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/family-tree" element={<FamilyTreePage />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/conversations/:id" element={<ConversationDetail />} />
            <Route path="/news/:id" element={<NewsDetail />} />

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
              <Route path="comments" element={<AdminComments />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="tickers" element={<AdminTickers />} />
              <Route path="family-tree" element={<AdminFamilyTree />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
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
