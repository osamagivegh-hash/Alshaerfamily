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

// Family Tree Section Pages
import FamilyTreeGateway from './pages/FamilyTreeGateway'
import FounderAppreciation from './pages/FounderAppreciation'
import FounderDiscussions from './pages/FounderDiscussions'
import FamilyTreeDisplayPage from './pages/FamilyTreeDisplayPage'
import DevTeamPage from './pages/DevTeamPage'

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
import AdminFamilyTreeContent from './components/admin/AdminFamilyTreeContent'
import AdminDevTeamMessages from './components/admin/AdminDevTeamMessages'
import AdminUserManagement from './components/admin/AdminUserManagement'
import ProtectedRoute from './components/admin/ProtectedRoute'
import PermissionGuard from './components/admin/PermissionGuard'

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

            {/* Family Tree Section Routes */}
            <Route path="/family-tree" element={<FamilyTreeGateway />} />
            <Route path="/family-tree/appreciation" element={<FounderAppreciation />} />
            <Route path="/family-tree/discussions" element={<FounderDiscussions />} />
            <Route path="/family-tree/discussions/:id" element={<FounderDiscussions />} />
            <Route path="/family-tree/tree" element={<FamilyTreeDisplayPage />} />
            <Route path="/family-tree/dev-team" element={<DevTeamPage />} />
            {/* Legacy route - redirects to gateway */}
            <Route path="/family-tree-old" element={<FamilyTreePage />} />

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
              {/* Dashboard - accessible to all logged in users */}
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* News - requires 'news' permission */}
              <Route path="news" element={
                <PermissionGuard permission="news">
                  <AdminNews />
                </PermissionGuard>
              } />

              {/* Conversations - requires 'conversations' permission */}
              <Route path="conversations" element={
                <PermissionGuard permission="conversations">
                  <AdminConversations />
                </PermissionGuard>
              } />

              {/* Articles - requires 'articles' permission */}
              <Route path="articles" element={
                <PermissionGuard permission="articles">
                  <AdminArticles />
                </PermissionGuard>
              } />

              {/* Palestine - requires 'palestine' permission */}
              <Route path="palestine" element={
                <PermissionGuard permission="palestine">
                  <AdminPalestine />
                </PermissionGuard>
              } />

              {/* Gallery - requires 'gallery' permission */}
              <Route path="gallery" element={
                <PermissionGuard permission="gallery">
                  <AdminGallery />
                </PermissionGuard>
              } />

              {/* Comments - requires articles, news, or conversations permission */}
              <Route path="comments" element={
                <PermissionGuard permission="articles">
                  <AdminComments />
                </PermissionGuard>
              } />

              {/* Contacts - requires 'contacts' permission */}
              <Route path="contacts" element={
                <PermissionGuard permission="contacts">
                  <AdminContacts />
                </PermissionGuard>
              } />

              {/* Tickers - requires 'news' or 'palestine' permission */}
              <Route path="tickers" element={
                <PermissionGuard permission="news">
                  <AdminTickers />
                </PermissionGuard>
              } />

              {/* Family Tree - requires 'family-tree' permission */}
              <Route path="family-tree" element={
                <PermissionGuard permission="family-tree">
                  <AdminFamilyTree />
                </PermissionGuard>
              } />

              {/* Family Tree Content - requires 'family-tree' permission */}
              <Route path="family-tree-content" element={
                <PermissionGuard permission="family-tree">
                  <AdminFamilyTreeContent />
                </PermissionGuard>
              } />

              {/* Dev Team - requires 'dev-team' permission */}
              <Route path="dev-team" element={
                <PermissionGuard permission="dev-team">
                  <AdminDevTeamMessages />
                </PermissionGuard>
              } />

              {/* User Management - handled internally (super-admin only) */}
              <Route path="users" element={<AdminUserManagement />} />

              {/* Settings - requires 'settings' permission */}
              <Route path="settings" element={
                <PermissionGuard permission="settings">
                  <AdminSettings />
                </PermissionGuard>
              } />
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
