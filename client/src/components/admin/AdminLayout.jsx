import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', path: '/admin/dashboard', icon: '📊' },
    { id: 'news', label: 'الأخبار', path: '/admin/news', icon: '📰' },
    { id: 'conversations', label: 'الحوارات', path: '/admin/conversations', icon: '💬' },
    { id: 'palestine', label: 'فلسطين', path: '/admin/palestine', icon: '🏛️' },
    { id: 'articles', label: 'المقالات', path: '/admin/articles', icon: '📝' },
    { id: 'gallery', label: 'معرض الصور', path: '/admin/gallery', icon: '🖼️' },
    { id: 'contacts', label: 'الرسائل', path: '/admin/contacts', icon: '📧' },
    { id: 'tickers', label: 'شريط الأخبار', path: '/admin/tickers', icon: '📺' },
    { id: 'settings', label: 'الإعدادات', path: '/admin/settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-palestine-black transform ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
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
            <div className="w-10 h-10 bg-palestine-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="mr-3">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-gray-300 text-sm">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center px-6 py-3 text-right transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-palestine-green text-white border-l-4 border-palestine-red'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl ml-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-6">
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
              
              <div className="flex items-center">
                <span className="text-sm text-gray-600 ml-2">مرحباً،</span>
                <span className="text-sm font-medium text-palestine-black">{user?.username}</span>
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
