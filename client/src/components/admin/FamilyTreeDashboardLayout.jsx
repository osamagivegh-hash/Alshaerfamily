import React, { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'

/**
 * Family Tree Dashboard Layout
 * 
 * Completely isolated dashboard for Family Tree management only.
 * Separate from the main CMS Dashboard.
 */
const FamilyTreeDashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, logout } = useAdmin()
    const navigate = useNavigate()
    const location = useLocation()

    // Family Tree Dashboard menu items only
    const menuItems = [
        { id: 'overview', label: 'نظرة عامة', path: '/family-dashboard', icon: '📊' },
        { id: 'members', label: 'أفراد العائلة', path: '/family-dashboard/members', icon: '👥' },
        { id: 'tree-structure', label: 'هيكل الشجرة', path: '/family-dashboard/tree', icon: '🌳' },
        { id: 'content', label: 'محتوى الشجرة', path: '/family-dashboard/content', icon: '📄' },
        { id: 'backups', label: 'النسخ الاحتياطية', path: '/family-dashboard/backups', icon: '💾' },
    ]

    // Super Admin only items
    const superAdminItems = [
        { id: 'audit-logs', label: 'سجلات التدقيق', path: '/family-dashboard/audit-logs', icon: '📋' },
        { id: 'settings', label: 'الإعدادات', path: '/family-dashboard/settings', icon: '⚙️' },
    ]

    const handleLogout = () => {
        logout()
    }

    const isActive = (path) => location.pathname === path

    // Get role display info
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'super-admin': return { label: 'مدير أعلى', color: 'bg-purple-500' }
            case 'admin': return { label: 'مدير', color: 'bg-blue-500' }
            case 'editor': return { label: 'محرر شجرة العائلة', color: 'bg-emerald-500' }
            default: return { label: role, color: 'bg-gray-500' }
        }
    }

    const roleDisplay = getRoleDisplay(user?.role)
    const isSuperAdmin = user?.role === 'super-admin'

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex" dir="rtl">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-emerald-800 to-emerald-900 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto shadow-2xl`}>

                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🌳</span>
                        <div>
                            <h1 className="text-xl font-bold text-white">شجرة العائلة</h1>
                            <span className="text-emerald-200 text-xs">لوحة تحكم مستقلة</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 bg-emerald-900/50 border-b border-emerald-700">
                    <div className="flex items-center">
                        <div className={`w-12 h-12 ${roleDisplay.color} rounded-full flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-lg">
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
                <nav className="mt-6 pb-32">
                    {/* Main Menu */}
                    <div className="px-4 mb-2">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                            إدارة شجرة العائلة
                        </span>
                    </div>

                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                navigate(item.path)
                                setSidebarOpen(false)
                            }}
                            className={`w-full flex items-center px-6 py-3 text-right transition-all duration-200 ${isActive(item.path)
                                ? 'bg-emerald-600 text-white border-l-4 border-amber-400 shadow-md'
                                : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                                }`}
                        >
                            <span className="text-xl ml-3">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}

                    {/* Super Admin Section */}
                    {isSuperAdmin && (
                        <>
                            <div className="px-4 mt-6 mb-2">
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                    إدارة النظام
                                </span>
                            </div>
                            {superAdminItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        navigate(item.path)
                                        setSidebarOpen(false)
                                    }}
                                    className={`w-full flex items-center px-6 py-3 text-right transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-emerald-600 text-white border-l-4 border-amber-400 shadow-md'
                                        : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl ml-3">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {/* Switch to CMS Dashboard */}
                    {(user?.role === 'super-admin' || user?.role === 'admin') && (
                        <div className="px-4 mt-6">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
                            >
                                <span className="text-xl ml-2">🏢</span>
                                <span className="font-medium">الانتقال لإدارة المحتوى</span>
                            </button>
                        </div>
                    )}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 w-full p-6 bg-emerald-900">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-right text-emerald-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
                    >
                        <span className="text-xl ml-3">🚪</span>
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:mr-72">
                {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-40">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-emerald-600 hover:text-emerald-800 text-2xl"
                            >
                                ☰
                            </button>
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-2xl">🌳</span>
                                <h1 className="text-xl font-semibold text-emerald-800">
                                    {menuItems.find(item => isActive(item.path))?.label ||
                                        superAdminItems.find(item => isActive(item.path))?.label ||
                                        'لوحة شجرة العائلة'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-reverse space-x-4">
                            <button
                                onClick={() => navigate('/family-tree')}
                                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors duration-200 flex items-center gap-1"
                            >
                                <span>👁️</span>
                                عرض الشجرة
                            </button>

                            <div className="w-px h-6 bg-emerald-200"></div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">مرحباً،</span>
                                <span className="text-sm font-medium text-emerald-800">{user?.displayName || user?.username}</span>
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

export default FamilyTreeDashboardLayout
