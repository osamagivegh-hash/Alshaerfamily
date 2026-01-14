import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminProvider } from './contexts/AdminContext'
import { FamilyTreeAuthProvider } from './contexts/FamilyTreeAuthContext'

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
import FamilyTreeBranchSelection from './pages/FamilyTreeBranchSelection'
import ZaharBranchSelection from './pages/ZaharBranchSelection'
import DevTeamPage from './pages/DevTeamPage'

// CMS Admin Components
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
import AdminDevTeamMessages from './components/admin/AdminDevTeamMessages'
import AdminUserManagement from './components/admin/AdminUserManagement'
import CMSBackupManager from './components/admin/CMSBackupManager'
import ProtectedRoute from './components/admin/ProtectedRoute'
import PermissionGuard from './components/admin/PermissionGuard'

// ===== ISOLATED FAMILY TREE DASHBOARD (Separate Auth System) =====
import FamilyTreeDashboardLayout from './components/admin/FamilyTreeDashboardLayout'
import FamilyTreeDashboardOverview from './components/admin/FamilyTreeDashboardOverview'
import FamilyTreeLogin from './components/FamilyTree/FamilyTreeLogin'
import FamilyTreeProtectedRoute from './components/FamilyTree/FamilyTreeProtectedRoute'
import AdminFamilyTree from './components/admin/AdminFamilyTree'
import AdminFamilyTreeContent from './components/admin/AdminFamilyTreeContent'
import FamilyTreeBackupManager from './components/admin/FamilyTreeBackupManager'
import FamilyTreeUserManagement from './components/admin/FamilyTreeUserManagement'

function App() {
  return (
    <AdminProvider>
      <FamilyTreeAuthProvider>
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
              <Route path="/family-tree/discussions/:id" element={<FounderDiscussions />} />
              <Route path="/family-tree/tree" element={<FamilyTreeBranchSelection />} />
              <Route path="/family-tree/tree/zahar" element={<ZaharBranchSelection />} />
              <Route path="/family-tree/visual" element={<FamilyTreeDisplayPage />} />
              <Route path="/family-tree/dev-team" element={<DevTeamPage />} />
              {/* Legacy route - redirects to gateway */}
              <Route path="/family-tree-old" element={<FamilyTreePage />} />

              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/conversations/:id" element={<ConversationDetail />} />
              <Route path="/news/:id" element={<NewsDetail />} />

              {/* ===== CMS ADMIN ROUTES (Uses AdminContext) ===== */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ===== ISOLATED FAMILY TREE DASHBOARD (Uses FamilyTreeAuthContext) ===== */}
              {/* SECURITY: This is a completely separate authentication system */}
              <Route path="/family-dashboard/login" element={<FamilyTreeLogin />} />
              <Route path="/family-dashboard/*" element={
                <FamilyTreeProtectedRoute>
                  <FamilyTreeDashboardLayout />
                </FamilyTreeProtectedRoute>
              }>
                {/* Family Tree Dashboard Pages */}
                <Route index element={<FamilyTreeDashboardOverview />} />
                <Route path="members" element={<AdminFamilyTree />} />
                <Route path="tree" element={<AdminFamilyTree />} />
                <Route path="content" element={<AdminFamilyTreeContent />} />
                <Route path="backups" element={<FamilyTreeBackupManager />} />
                <Route path="users" element={<FamilyTreeUserManagement />} />
              </Route>

              {/* ===== MAIN CMS ADMIN ROUTES ===== */}
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

                {/* Dev Team - requires 'dev-team' permission */}
                <Route path="dev-team" element={
                  <PermissionGuard permission="dev-team">
                    <AdminDevTeamMessages />
                  </PermissionGuard>
                } />

                {/* User Management - handled internally (super-admin only) */}
                <Route path="users" element={<AdminUserManagement />} />

                {/* CMS Backups - admin/super-admin only */}
                <Route path="cms-backups" element={<CMSBackupManager />} />

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
      </FamilyTreeAuthProvider>
    </AdminProvider>
  )
}

export default App
