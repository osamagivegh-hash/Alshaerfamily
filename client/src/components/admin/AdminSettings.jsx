import React, { useState } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const { user, changePassword } = useAdmin()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقين')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-palestine-black">الإعدادات</h1>
        <p className="text-gray-600 mt-2">إدارة إعدادات الحساب والنظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-palestine-black mb-4">معلومات الحساب</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="form-input bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-input bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الدور
              </label>
              <input
                type="text"
                value={user?.role === 'admin' ? 'مدير' : user?.role || ''}
                disabled
                className="form-input bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                آخر تسجيل دخول
              </label>
              <input
                type="text"
                value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-SA') : 'غير متاح'}
                disabled
                className="form-input bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-palestine-black mb-4">تغيير كلمة المرور</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور الحالية *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className="form-input"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تأكيد كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className="form-input"
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-palestine-green hover:bg-olive-700 text-white'
              }`}
            >
              {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-palestine-black mb-4">معلومات النظام</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🖥️</span>
            </div>
            <h3 className="font-semibold text-palestine-black">حالة الخادم</h3>
            <p className="text-green-600 text-sm mt-1">يعمل بشكل طبيعي</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">💾</span>
            </div>
            <h3 className="font-semibold text-palestine-black">قاعدة البيانات</h3>
            <p className="text-blue-600 text-sm mt-1">متصلة</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🔄</span>
            </div>
            <h3 className="font-semibold text-palestine-black">النسخ الاحتياطي</h3>
            <p className="text-purple-600 text-sm mt-1">محدث</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-palestine-black mb-4">إعدادات الأمان</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-palestine-black">تسجيل العمليات</h3>
              <p className="text-gray-600 text-sm">تسجيل جميع العمليات الإدارية</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="w-5 h-5 text-palestine-green"
              />
              <span className="text-green-600 text-sm mr-2">مفعل</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-palestine-black">حماية من الهجمات</h3>
              <p className="text-gray-600 text-sm">حد أقصى للطلبات لمنع الهجمات</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="w-5 h-5 text-palestine-green"
              />
              <span className="text-green-600 text-sm mr-2">مفعل</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-palestine-black">التشفير</h3>
              <p className="text-gray-600 text-sm">تشفير البيانات الحساسة</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="w-5 h-5 text-palestine-green"
              />
              <span className="text-green-600 text-sm mr-2">مفعل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-palestine-black mb-4">النسخ الاحتياطي والصيانة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-palestine-green text-palestine-green rounded-lg hover:bg-palestine-green hover:text-white transition-colors duration-200">
            <div className="text-2xl mb-2">💾</div>
            <h3 className="font-semibold">إنشاء نسخة احتياطية</h3>
            <p className="text-sm mt-1">نسخ احتياطي لجميع البيانات</p>
          </button>

          <button className="p-4 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200">
            <div className="text-2xl mb-2">🧹</div>
            <h3 className="font-semibold">تنظيف البيانات</h3>
            <p className="text-sm mt-1">إزالة البيانات غير المستخدمة</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
