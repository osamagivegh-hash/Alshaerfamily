import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(credentials)
      toast.success('تم تسجيل الدخول بنجاح')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-palestine-green to-olive-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">لوحة إدارة</h1>
          <h2 className="text-xl text-palestine-white/90">عائلة الشاعر</h2>
          <div className="w-16 h-1 bg-palestine-white mx-auto mt-4 rounded"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-palestine-black">تسجيل الدخول</h3>
            <p className="text-gray-600 mt-2">أدخل بيانات المدير للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-palestine-black mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="أدخل اسم المستخدم"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-palestine-black mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="أدخل كلمة المرور"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-palestine-green hover:bg-olive-700 text-white'
                }`}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-olive-50 rounded-lg">
            <p className="text-xs text-olive-700 text-center">
              🔒 للحصول على بيانات الدخول، تواصل مع مدير النظام
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-palestine-white/80 hover:text-palestine-white transition-colors duration-200"
          >
            ← العودة إلى الموقع الرئيسي
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
