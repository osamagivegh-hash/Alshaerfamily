import React, { useState, useEffect } from 'react'
import { adminFamilyTickerNews, adminPalestineTickerNews, adminTickerSettings } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminTickers = () => {
  const [familyTickerNews, setFamilyTickerNews] = useState([])
  const [palestineTickerNews, setPalestineTickerNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTickerType, setActiveTickerType] = useState('family')
  const [formData, setFormData] = useState({
    headline: '',
    source: '',
    url: '',
    active: true,
    order: 0
  })
  const [settings, setSettings] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const tickerLabels = {
    family: 'الشريط العائلي',
    palestine: 'شريط فلسطين'
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          fetchFamilyTickerData(),
          fetchPalestineTickerData(),
          fetchSettings()
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const fetchFamilyTickerData = async () => {
    try {
      const data = await adminFamilyTickerNews.getAll()
      setFamilyTickerNews(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setFamilyTickerNews([])
    }
  }

  const fetchPalestineTickerData = async () => {
    try {
      const data = await adminPalestineTickerNews.getAll()
      setPalestineTickerNews(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setPalestineTickerNews([])
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
    setIsSubmitting(true)

    const api = activeTickerType === 'family' ? adminFamilyTickerNews : adminPalestineTickerNews
    const payload = activeTickerType === 'family'
      ? {
          headline: formData.headline,
          active: formData.active,
          order: Number(formData.order) || 0
        }
      : {
          headline: formData.headline,
          source: formData.source,
          url: formData.url,
          active: formData.active,
          order: Number(formData.order) || 0
        }

    try {
      if (editingItem) {
        const itemId = editingItem.id || editingItem._id
        await api.update(itemId, payload)
        toast.success('تم تحديث عنصر الشريط بنجاح')
      } else {
        await api.create(payload)
        toast.success('تم إضافة عنصر الشريط بنجاح')
      }
      
      setShowForm(false)
      setEditingItem(null)
      setFormData({
        headline: '',
        source: '',
        url: '',
        active: true,
        order: 0
      })

      if (activeTickerType === 'family') {
        await fetchFamilyTickerData()
      } else {
        await fetchPalestineTickerData()
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item, type) => {
    setActiveTickerType(type)
    setEditingItem({ ...item, tickerType: type })
    setFormData({
      headline: item.headline || '',
      source: type === 'palestine' ? item.source || '' : '',
      url: type === 'palestine' ? item.url || '' : '',
      active: item.active !== undefined ? item.active : true,
      order: item.order || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id, type) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return

    try {
      const itemId = typeof id === 'object' ? (id.id || id._id) : id
      const api = type === 'family' ? adminFamilyTickerNews : adminPalestineTickerNews
      await api.delete(itemId)
      toast.success('تم حذف العنصر بنجاح')
      if (type === 'family') {
        await fetchFamilyTickerData()
      } else {
        await fetchPalestineTickerData()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (item, type) => {
    try {
      const itemId = item.id || item._id
      const api = type === 'family' ? adminFamilyTickerNews : adminPalestineTickerNews
      await api.update(itemId, { active: !item.active })
      toast.success(`تم ${item.active ? 'إيقاف' : 'تفعيل'} العنصر بنجاح`)
      if (type === 'family') {
        await fetchFamilyTickerData()
      } else {
        await fetchPalestineTickerData()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await adminTickerSettings.update(settings)
      toast.success('تم تحديث الإعدادات بنجاح')
      setShowSettings(false)
      await fetchSettings()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveOrder = async (item, direction, type) => {
    try {
      const itemId = item.id || item._id
      const newOrder = direction === 'up' ? item.order - 1 : item.order + 1
      const api = type === 'family' ? adminFamilyTickerNews : adminPalestineTickerNews
      await api.update(itemId, { order: newOrder })
      if (type === 'family') {
        await fetchFamilyTickerData()
      } else {
        await fetchPalestineTickerData()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading && familyTickerNews.length === 0 && palestineTickerNews.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-palestine-black">إدارة شريط الأخبار</h2>
          <p className="text-gray-600 mt-1">إدارة أخبار الشريط العائلي وأخبار فلسطين المباشرة</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary"
          >
            ⚙️ الإعدادات
          </button>
        </div>
      </div>

      {/* Family Ticker News Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-palestine-black">
            📰 أخبار الشريط العائلي
          </h3>
          <button
            onClick={() => {
              setActiveTickerType('family')
              setShowForm(true)
              setEditingItem(null)
              setFormData({
                headline: '',
                source: '',
                url: '',
                active: true,
                order: familyTickerNews.length
              })
            }}
            className="btn-primary"
          >
            + إضافة خبر عائلي
          </button>
        </div>
        
        {familyTickerNews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">لا توجد عناصر في الشريط العائلي</p>
            <p className="text-sm">اضغط على "إضافة خبر عائلي" لإضافة أول عنصر</p>
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
                {familyTickerNews
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item, index) => (
                    <tr key={item.id || item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveOrder(item, 'up', 'family')}
                            disabled={index === 0}
                            className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
                            title="نقل للأعلى"
                          >
                            ↑
                          </button>
                          <span className="font-medium">{item.order || 0}</span>
                          <button
                            onClick={() => handleMoveOrder(item, 'down', 'family')}
                            disabled={index === familyTickerNews.length - 1}
                            className={`p-1 ${index === familyTickerNews.length - 1 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
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
                          onClick={() => handleToggleActive(item, 'family')}
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
                            onClick={() => handleEdit(item, 'family')}
                            className="text-palestine-green hover:text-olive-700 px-3 py-1 rounded transition-colors"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id || item._id, 'family')}
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

      {/* Palestine Ticker News Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-palestine-black">
              🇵🇸 أخبار فلسطين المباشرة (مُدارة يدوياً)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              أضف عناوين الأخبار يدوياً وسيتم عرضها فوراً في شريط أخبار فلسطين. عند عدم وجود عناوين، سيتم الاعتماد على مصادر الأخبار الخارجية (إن وُجدت المفاتيح).
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTickerType('palestine')
              setShowForm(true)
              setEditingItem(null)
              setFormData({
                headline: '',
                source: '',
                url: '',
                active: true,
                order: palestineTickerNews.length
              })
            }}
            className="btn-primary"
          >
            + إضافة خبر فلسطين
          </button>
        </div>

        {palestineTickerNews.length === 0 ? (
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <p className="text-gray-700 mb-2">
              لم يتم إضافة أي أخبار يدوية لشريط فلسطين بعد.
            </p>
            <p className="text-sm text-gray-600">
              أضف الأخبار هنا للتحكم الكامل في محتوى الشريط. في حال عدم وجود أخبار، سيقوم النظام بمحاولة جلب الأخبار من مزود الـ API المُحدد في الإعدادات.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-palestine-black">الترتيب</th>
                  <th className="text-right py-3 px-4 font-semibold text-palestine-black">العنوان</th>
                  <th className="text-right py-3 px-4 font-semibold text-palestine-black">المصدر</th>
                  <th className="text-center py-3 px-4 font-semibold text-palestine-black">الرابط</th>
                  <th className="text-center py-3 px-4 font-semibold text-palestine-black">الحالة</th>
                  <th className="text-center py-3 px-4 font-semibold text-palestine-black">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {palestineTickerNews
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item, index) => (
                    <tr key={item.id || item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveOrder(item, 'up', 'palestine')}
                            disabled={index === 0}
                            className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
                            title="نقل للأعلى"
                          >
                            ↑
                          </button>
                          <span className="font-medium">{item.order || 0}</span>
                          <button
                            onClick={() => handleMoveOrder(item, 'down', 'palestine')}
                            disabled={index === palestineTickerNews.length - 1}
                            className={`p-1 ${index === palestineTickerNews.length - 1 ? 'text-gray-300' : 'text-palestine-green hover:text-olive-700'}`}
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
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{item.source || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-palestine-green hover:text-olive-700 underline"
                          >
                            فتح الرابط
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">لا يوجد</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item, 'palestine')}
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
                            onClick={() => handleEdit(item, 'palestine')}
                            className="text-palestine-green hover:text-olive-700 px-3 py-1 rounded transition-colors"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id || item._id, 'palestine')}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-palestine-black">
                  {editingItem
                    ? `تعديل عنصر ${tickerLabels[activeTickerType]}`
                    : `إضافة خبر لـ ${tickerLabels[activeTickerType]}`}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    setFormData({
                      headline: '',
                      source: '',
                      url: '',
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

              {activeTickerType === 'palestine' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-palestine-black mb-2">
                      المصدر (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="form-input"
                      placeholder="مثال: وكالة الأنباء الفلسطينية"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-palestine-black mb-2">
                      رابط الخبر (اختياري)
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="form-input"
                      placeholder="https://example.com/article"
                    />
                    <p className="text-xs text-gray-500 mt-1">سيتم فتح الرابط في نافذة جديدة عند الضغط عليه من الشريط.</p>
                  </div>
                </div>
              )}

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
                        source: '',
                        url: '',
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
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : editingItem ? 'تحديث' : 'إضافة'}
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
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
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

