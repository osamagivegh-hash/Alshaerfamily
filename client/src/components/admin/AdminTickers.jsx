import React, { useState, useEffect } from 'react'
import { adminFamilyTickerNews, adminTickerSettings } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminTickers = () => {
  const [tickerNews, setTickerNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    headline: '',
    active: true,
    order: 0
  })
  const [settings, setSettings] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchTickerNews()
    fetchSettings()
  }, [])

  const fetchTickerNews = async () => {
    try {
      const data = await adminFamilyTickerNews.getAll()
      setTickerNews(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setTickerNews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const data = await adminTickerSettings.get()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingItem) {
        const itemId = editingItem.id || editingItem._id
        await adminFamilyTickerNews.update(itemId, formData)
        toast.success('تم تحديث عنصر الشريط بنجاح')
      } else {
        await adminFamilyTickerNews.create(formData)
        toast.success('تم إضافة عنصر الشريط بنجاح')
      }
      
      setShowForm(false)
      setEditingItem(null)
      setFormData({
        headline: '',
        active: true,
        order: 0
      })
      fetchTickerNews()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      headline: item.headline || '',
      active: item.active !== undefined ? item.active : true,
      order: item.order || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return

    try {
      const itemId = typeof id === 'object' ? (id.id || id._id) : id
      await adminFamilyTickerNews.delete(itemId)
      toast.success('تم حذف العنصر بنجاح')
      fetchTickerNews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (item) => {
    try {
      const itemId = item.id || item._id
      await adminFamilyTickerNews.update(itemId, { active: !item.active })
      toast.success(`تم ${item.active ? 'إيقاف' : 'تفعيل'} العنصر بنجاح`)
      fetchTickerNews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adminTickerSettings.update(settings)
      toast.success('تم تحديث الإعدادات بنجاح')
      setShowSettings(false)
      fetchSettings()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMoveOrder = async (item, direction) => {
    try {
      const itemId = item.id || item._id
      const newOrder = direction === 'up' ? item.order - 1 : item.order + 1
      await adminFamilyTickerNews.update(itemId, { order: newOrder })
      fetchTickerNews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading && tickerNews.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-palestine-black">إدارة شريط الأخبار</h2>
          <p className="text-gray-600 mt-1">إدارة أخبار الشريط العائلي وإعدادات شريط أخبار فلسطين</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary"
          >
            ⚙️ الإعدادات
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingItem(null)
              setFormData({
                headline: '',
                active: true,
                order: tickerNews.length
              })
            }}
            className="btn-primary"
          >
            + إضافة عنصر جديد
          </button>
        </div>
      </div>

      {/* Family Ticker News Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-palestine-black mb-4">
          📰 أخبار الشريط العائلي
        </h3>
        
        {tickerNews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">لا توجد عناصر في الشريط العائلي</p>
            <p className="text-sm">اضغط على "إضافة عنصر جديد" لإضافة أول عنصر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-palestine-black">الترتيب</th>
                  <th className="text-right py-3 px-4 font-semibold text-palestine-black">العنوان</th>
                  <th className="text-center py-3 px-4 font-semibold text-palestine-black">الحالة</th>
                  <th className="text-center py-3 px-4 font-semibold text-palestine-black">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tickerNews
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item, index) => (
                    <tr key={item.id || item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveOrder(item, 'up')}
                            disabled={index === 0}
                            className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
                            title="نقل للأعلى"
                          >
                            ↑
                          </button>
                          <span className="font-medium">{item.order || 0}</span>
                          <button
                            onClick={() => handleMoveOrder(item, 'down')}
                            disabled={index === tickerNews.length - 1}
                            className={`p-1 ${index === tickerNews.length - 1 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
                            title="نقل للأسفل"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="text-palestine-black font-medium">{item.headline}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.active ? '✓ نشط' : '✗ غير نشط'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-palestine-green hover:text-olive-700 px-3 py-1 rounded transition-colors"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id || item._id)}
                            className="text-palestine-red hover:text-red-700 px-3 py-1 rounded transition-colors"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Palestine Ticker Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-palestine-black mb-4">
          🇵🇸 شريط أخبار فلسطين المباشرة
        </h3>
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
          <p className="text-gray-700 mb-2">
            <strong>ملاحظة:</strong> أخبار فلسطين يتم جلبها تلقائياً من API خارجي (GNews.io أو NewsAPI.org).
          </p>
          <p className="text-sm text-gray-600">
            يمكنك التحكم في إعدادات الشريط من خلال زر "الإعدادات" أعلاه.
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-palestine-black">
                  {editingItem ? 'تعديل عنصر الشريط' : 'إضافة عنصر جديد'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    setFormData({
                      headline: '',
                      active: true,
                      order: 0
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    العنوان / الخبر
                  </label>
                  <textarea
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="form-textarea"
                    rows="3"
                    placeholder="أدخل عنوان الخبر أو العنوان الذي سيظهر في الشريط..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-palestine-black mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="form-input"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">رقم أقل = يظهر أولاً</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-palestine-black mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                      className="form-input"
                    >
                      <option value="true">نشط</option>
                      <option value="false">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingItem(null)
                      setFormData({
                        headline: '',
                        active: true,
                        order: 0
                      })
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : editingItem ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && settings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-palestine-black">
                  إعدادات الشريط
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.palestineTickerEnabled}
                      onChange={(e) => setSettings({ ...settings, palestineTickerEnabled: e.target.checked })}
                      className="w-5 h-5 text-palestine-green"
                    />
                    <span className="text-sm font-medium text-palestine-black">
                      تفعيل شريط أخبار فلسطين المباشرة
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    فترة التحديث التلقائي (بالميلي ثانية)
                  </label>
                  <input
                    type="number"
                    value={settings.autoUpdateInterval}
                    onChange={(e) => setSettings({ ...settings, autoUpdateInterval: parseInt(e.target.value) || 60000 })}
                    className="form-input"
                    min="30000"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    القيمة الحالية: {settings.autoUpdateInterval / 1000} ثانية ({settings.autoUpdateInterval / 60000} دقيقة)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    الحد الأقصى للعناوين
                  </label>
                  <input
                    type="number"
                    value={settings.maxHeadlines}
                    onChange={(e) => setSettings({ ...settings, maxHeadlines: parseInt(e.target.value) || 10 })}
                    className="form-input"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    مزود API الأخبار
                  </label>
                  <select
                    value={settings.newsApiProvider}
                    onChange={(e) => setSettings({ ...settings, newsApiProvider: e.target.value })}
                    className="form-input"
                  >
                    <option value="gnews">GNews.io</option>
                    <option value="newsapi">NewsAPI.org</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTickers

