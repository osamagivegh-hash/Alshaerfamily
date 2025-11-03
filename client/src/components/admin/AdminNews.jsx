import React, { useState, useEffect } from 'react'
import { adminNews } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'
import ImageUpload from './ImageUpload'

const AdminNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    headline: '',
    summary: '',
    tags: [],
    category: ''
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const data = await adminNews.getAll()
      setNews(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingNews) {
        const newsId = editingNews.id || editingNews._id
        await adminNews.update(newsId, formData)
        toast.success('تم تحديث الخبر بنجاح')
      } else {
        await adminNews.create(formData)
        toast.success('تم إضافة الخبر بنجاح')
      }
      
      setShowForm(false)
      setEditingNews(null)
      setFormData({
        title: '',
        content: '',
        author: '',
        date: new Date().toISOString().split('T')[0],
        image: '',
        headline: '',
        summary: '',
        tags: [],
        category: ''
      })
      fetchNews()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title || '',
      content: newsItem.content || '',
      author: newsItem.author || newsItem.reporter || '',
      date: newsItem.date || new Date().toISOString().split('T')[0],
      image: newsItem.image || '',
      headline: newsItem.headline || newsItem.title || '',
      summary: newsItem.summary || '',
      tags: Array.isArray(newsItem.tags) ? newsItem.tags : [],
      category: newsItem.category || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return

    try {
      const newsId = typeof id === 'object' ? (id.id || id._id) : id
      await adminNews.delete(newsId)
      toast.success('تم حذف الخبر بنجاح')
      fetchNews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNews.length === 0) {
      toast.error('يرجى اختيار عناصر للحذف')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedNews.length} خبر؟`)) return

    try {
      await adminNews.bulkDelete(selectedNews)
      toast.success(`تم حذف ${selectedNews.length} خبر بنجاح`)
      setSelectedNews([])
      fetchNews()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectAll = () => {
    if (selectedNews.length === news.length) {
      setSelectedNews([])
    } else {
      setSelectedNews(news.map(item => item.id || item._id))
    }
  }

  if (loading && !showForm) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-palestine-black">إدارة الأخبار</h1>
        <div className="flex gap-4">
          {selectedNews.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              حذف المحدد ({selectedNews.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true)
              setEditingNews(null)
              setFormData({
                title: '',
                content: '',
                author: '',
                date: new Date().toISOString().split('T')[0],
                image: '',
                headline: '',
                summary: '',
                tags: [],
                category: ''
              })
            }}
            className="btn-primary"
          >
            إضافة خبر جديد
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-palestine-black">
                {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  عنوان الخبر *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أدخل عنوان الخبر"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="صورة الخبر"
                value={formData.image}
                onChange={(url) => setFormData({...formData, image: url})}
              />

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  عنوان مختصر (Headline)
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({...formData, headline: e.target.value})}
                  className="form-input"
                  placeholder="عنوان مختصر للعرض في القائمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  ملخص الخبر
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={3}
                  className="form-textarea"
                  placeholder="ملخص قصير للخبر"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  محتوى الخبر *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={8}
                  className="form-textarea"
                  placeholder="اكتب محتوى الخبر"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    الكاتب *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                    className="form-input"
                    placeholder="اسم كاتب الخبر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'جاري الحفظ...' : (editingNews ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md">
        {news.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNews.length === news.length}
                onChange={handleSelectAll}
                className="ml-2"
              />
              <span className="text-sm text-gray-600">
                تحديد الكل ({news.length} خبر)
              </span>
            </label>
          </div>
        )}

        {news.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد أخبار متاحة
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {news.map((newsItem) => (
              <div key={newsItem.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNews.includes(newsItem.id || newsItem._id)}
                      onChange={(e) => {
                        const itemId = newsItem.id || newsItem._id
                        if (e.target.checked) {
                          setSelectedNews([...selectedNews, itemId])
                        } else {
                          setSelectedNews(selectedNews.filter(id => id !== itemId))
                        }
                      }}
                      className="ml-3"
                    />
                    {(newsItem.image || newsItem.coverImage) && (
                      <img
                        src={newsItem.image || newsItem.coverImage}
                        alt={newsItem.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-palestine-black">
                        {newsItem.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {(newsItem.summary || newsItem.content || '').substring(0, 100)}...
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>بواسطة: {newsItem.reporter || newsItem.author || 'غير محدد'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(newsItem.date).toLocaleDateString('ar-SA')}</span>
                        {(newsItem.image || newsItem.coverImage) && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-palestine-green">✓ صورة</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(newsItem)}
                      className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(newsItem.id || newsItem._id)}
                      className="bg-palestine-red text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNews
