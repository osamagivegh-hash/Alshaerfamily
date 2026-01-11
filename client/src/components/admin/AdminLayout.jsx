import React, { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  // All menu items with their required permissions
  // Organized into sections: Family Tree Dashboard and CMS Dashboard
  const allMenuItems = [
    // Dashboard Overview (everyone sees this)
    { id: 'dashboard', label: 'لوحة التحكم', path: '/admin/dashboard', icon: '📊', permissions: [], section: 'main' },

    // ===== FAMILY TREE DASHBOARD SECTION =====
    { id: 'ft-divider', label: '── شجرة العائلة ──', type: 'divider', permissions: ['family-tree'], section: 'family-tree' },
    { id: 'family-tree', label: 'إدارة الشجرة', path: '/admin/family-tree', icon: '🌳', permissions: ['family-tree'], section: 'family-tree' },
    { id: 'family-tree-content', label: 'محتوى الشجرة', path: '/admin/family-tree-content', icon: '📄', permissions: ['family-tree'], section: 'family-tree' },
    { id: 'family-tree-backups', label: 'النسخ الاحتياطية', path: '/admin/family-tree-backups', icon: '💾', permissions: ['family-tree'], section: 'family-tree' },

    // ===== CMS DASHBOARD SECTION =====
    { id: 'cms-divider', label: '── إدارة المحتوى ──', type: 'divider', permissions: ['news', 'articles', 'conversations', 'palestine', 'gallery'], section: 'cms' },
    { id: 'news', label: 'الأخبار', path: '/admin/news', icon: '📰', permissions: ['news'], section: 'cms' },
    { id: 'conversations', label: 'الحوارات', path: '/admin/conversations', icon: '💬', permissions: ['conversations'], section: 'cms' },
    { id: 'palestine', label: 'فلسطين', path: '/admin/palestine', icon: '🏛️', permissions: ['palestine'], section: 'cms' },
    { id: 'articles', label: 'المقالات', path: '/admin/articles', icon: '📝', permissions: ['articles'], section: 'cms' },
    { id: 'gallery', label: 'معرض الصور', path: '/admin/gallery', icon: '🖼️', permissions: ['gallery'], section: 'cms' },
    { id: 'comments', label: 'التعليقات', path: '/admin/comments', icon: '💬', permissions: ['articles', 'news', 'conversations'], section: 'cms' },
    { id: 'contacts', label: 'الرسائل', path: '/admin/contacts', icon: '📧', permissions: ['contacts'], section: 'cms' },
    { id: 'tickers', label: 'شريط الأخبار', path: '/admin/tickers', icon: '📺', permissions: ['news', 'palestine'], section: 'cms' },
    { id: 'cms-backups', label: 'النسخ الاحتياطية', path: '/admin/cms-backups', icon: '💾', permissions: [], roles: ['super-admin', 'admin'], section: 'cms' },

    // ===== SYSTEM SECTION =====
    { id: 'sys-divider', label: '── النظام ──', type: 'divider', permissions: [], roles: ['super-admin', 'admin'], section: 'system' },
    { id: 'dev-team', label: 'رسائل التطوير', path: '/admin/dev-team', icon: '👨‍💻', permissions: ['dev-team'], section: 'system' },
    { id: 'settings', label: 'الإعدادات', path: '/admin/settings', icon: '⚙️', permissions: ['settings'], section: 'system' },
    { id: 'users', label: 'إدارة المستخدمين', path: '/admin/users', icon: '👥', roles: ['super-admin'], section: 'system' },
  ]

  // Filter menu items based on user role and permissions
  const menuItems = useMemo(() => {
    if (!user) return [];

    // Super-admin and admin see everything
    if (user.role === 'super-admin' || user.role === 'admin') {
      return allMenuItems;
    }

    // Editor sees only items they have permission for
    const userPermissions = user.permissions || [];
    return allMenuItems.filter(item => {
      // Check if item requires specific roles
      if (item.roles && item.roles.length > 0) {
        return item.roles.includes(user.role);
      }

      // No permissions required (like dashboard)
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Check if user has any of the required permissions
      return item.permissions.some(p => userPermissions.includes(p));
    });
  }, [user]);

  const handleLogout = () => {
    logout()
  }

  const isActive = (path) => location.pathname === path

  // Get role display info
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'super-admin': return { label: 'مدير أعلى', color: 'bg-purple-500' };
      case 'admin': return { label: 'مدير', color: 'bg-blue-500' };
      case 'editor': return { label: 'محرر', color: 'bg-teal-500' };
      default: return { label: role, color: 'bg-gray-500' };
    }
  }

  const roleDisplay = getRoleDisplay(user?.role);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-palestine-black transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-palestine-green">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-palestine-green/10 border-b border-gray-700">
          <div className="flex items-center">
            <div className={`w-10 h-10 ${roleDisplay.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold">
                {(user?.displayName || user?.username)?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="mr-3">
              <p className="text-white font-medium">{user?.displayName || user?.username}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleDisplay.color} text-white`}>
                {roleDisplay.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 pb-24">
          {menuItems.map((item) => (
            item.type === 'divider' ? (
              // Section Divider
              <div key={item.id} className="px-6 py-2 mt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ) : (
              // Menu Button
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-6 py-3 text-right transition-colors duration-200 ${isActive(item.path)
                  ? 'bg-palestine-green text-white border-l-4 border-palestine-red'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <span className="text-xl ml-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            )
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-6 bg-palestine-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-right text-gray-300 hover:bg-palestine-red hover:text-white rounded-lg transition-colors duration-200"
          >
            <span className="text-xl ml-3">🚪</span>
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:mr-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">☰</span>
              </button>
              <h1 className="text-xl font-semibold text-palestine-black mr-4">
                {menuItems.find(item => isActive(item.path))?.label || 'لوحة الإدارة'}
              </h1>
            </div>

            <div className="flex items-center space-x-reverse space-x-4">
              {/* Quick Actions */}
              <button
                onClick={() => navigate('/')}
                className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200"
              >
                عرض الموقع
              </button>

              <div className="w-px h-6 bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">مرحباً،</span>
                <span className="text-sm font-medium text-palestine-black">{user?.displayName || user?.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleDisplay.color} text-white`}>
                  {roleDisplay.label}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default AdminLayout
