import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminDashboard } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminDashboard.getStats()
        setStats(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const statCards = [
    {
      title: 'الأخبار',
      value: stats?.news || 0,
      icon: '📰',
      color: 'bg-blue-500',
      path: '/admin/news'
    },
    {
      title: 'الحوارات',
      value: stats?.conversations || 0,
      icon: '💬',
      color: 'bg-green-500',
      path: '/admin/conversations'
    },
    {
      title: 'المقالات',
      value: stats?.articles || 0,
      icon: '📝',
      color: 'bg-purple-500',
      path: '/admin/articles'
    },
    {
      title: 'صور فلسطين',
      value: stats?.palestine || 0,
      icon: '🏛️',
      color: 'bg-red-500',
      path: '/admin/palestine'
    },
    {
      title: 'معرض الصور',
      value: stats?.gallery || 0,
      icon: '🖼️',
      color: 'bg-yellow-500',
      path: '/admin/gallery'
    },
    {
      title: 'شجرة العائلة',
      value: stats?.persons || 0,
      icon: '🌳',
      color: 'bg-emerald-600',
      path: '/admin/family-tree'
    },
    {
      title: 'الرسائل',
      value: stats?.contacts || 0,
      icon: '📧',
      color: 'bg-teal-500',
      path: '/admin/contacts'
    },
    {
      title: 'رسائل جديدة',
      value: stats?.unreadContacts || 0,
      icon: '🔔',
      color: 'bg-orange-500',
      path: '/admin/contacts'
    }
  ]

  const quickActions = [
    {
      title: 'إضافة خبر جديد',
      description: 'أضف خبراً جديداً للعائلة',
      icon: '📰',
      color: 'bg-palestine-green',
      action: () => navigate('/admin/news/new')
    },
    {
      title: 'إضافة مقال',
      description: 'اكتب مقالاً جديداً',
      icon: '📝',
      color: 'bg-palestine-red',
      action: () => navigate('/admin/articles/new')
    },
    {
      title: 'إضافة فرد للعائلة',
      description: 'أضف شخصاً لشجرة العائلة',
      icon: '🌳',
      color: 'bg-emerald-600',
      action: () => navigate('/admin/family-tree')
    },
    {
      title: 'رفع صور جديدة',
      description: 'أضف صوراً لمعرض الصور',
      icon: '📷',
      color: 'bg-blue-600',
      action: () => navigate('/admin/gallery/new')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-palestine-green to-olive-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة الإدارة</h1>
        <p className="text-palestine-white/90">
          إدارة محتوى موقع عائلة الشاعر والتحكم في جميع الأقسام
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-palestine-black mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-palestine-black mb-6">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity duration-200 text-right`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-palestine-black mb-4">حالة النظام</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                <span className="text-green-800 font-medium">الخادم</span>
              </div>
              <span className="text-green-600 text-sm">يعمل بشكل طبيعي</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                <span className="text-green-800 font-medium">قاعدة البيانات</span>
              </div>
              <span className="text-green-600 text-sm">متصلة</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
                <span className="text-green-800 font-medium">النسخ الاحتياطي</span>
              </div>
              <span className="text-green-600 text-sm">محدث</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-palestine-black mb-4">إحصائيات سريعة</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">إجمالي المحتوى</span>
              <span className="text-2xl font-bold text-palestine-green">
                {(stats?.news || 0) + (stats?.conversations || 0) + (stats?.articles || 0) + (stats?.palestine || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">الرسائل الجديدة</span>
              <span className="text-2xl font-bold text-palestine-red">
                {stats?.unreadContacts || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
