import React, { useState, useEffect } from 'react'
import { adminGallery, adminUpload } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminGallery = () => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGalleries, setSelectedGalleries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: []
  })

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      const data = await adminGallery.getAll()
      setGalleries(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setGalleries([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await adminUpload.uploadImage(file)
      toast.success('تم رفع الصورة بنجاح')
      
      // Get the full URL - handle both relative and absolute URLs
      let imageUrl = response.url
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If relative URL, make it absolute
        const baseUrl = import.meta.env.PROD 
          ? window.location.origin 
          : 'http://localhost:5000'
        imageUrl = `${baseUrl}${imageUrl}`
      }
      
      // Add the uploaded image URL to the form data
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingGallery) {
        await adminGallery.update(editingGallery.id, formData)
        toast.success('تم تحديث المعرض بنجاح')
      } else {
        await adminGallery.create(formData)
        toast.success('تم إضافة المعرض بنجاح')
      }
      
      setShowForm(false)
      setEditingGallery(null)
      setFormData({
        title: '',
        description: '',
        images: []
      })
      fetchGalleries()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (gallery) => {
    setEditingGallery(gallery)
    setFormData({
      title: gallery.title,
      description: gallery.description,
      images: gallery.images || []
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعرض؟')) return

    try {
      await adminGallery.delete(id)
      toast.success('تم حذف المعرض بنجاح')
      fetchGalleries()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedGalleries.length === 0) {
      toast.error('يرجى اختيار عناصر للحذف')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedGalleries.length} معرض؟`)) return

    try {
      await adminGallery.bulkDelete(selectedGalleries)
      toast.success(`تم حذف ${selectedGalleries.length} معرض بنجاح`)
      setSelectedGalleries([])
      fetchGalleries()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectAll = () => {
    if (selectedGalleries.length === galleries.length) {
      setSelectedGalleries([])
    } else {
      setSelectedGalleries(galleries.map(item => item.id))
    }
  }

  const removeImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({...formData, images: newImages})
  }

  if (loading && !showForm) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-palestine-black">إدارة معرض الصور</h1>
          <p className="text-gray-600 mt-1">إدارة مجموعات الصور والذكريات العائلية</p>
        </div>
        <div className="flex gap-4">
          {selectedGalleries.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              حذف المحدد ({selectedGalleries.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true)
              setEditingGallery(null)
              setFormData({
                title: '',
                description: '',
                images: []
              })
            }}
            className="btn-primary"
          >
            إضافة معرض جديد
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-palestine-black">
                {editingGallery ? 'تعديل المعرض' : 'إضافة معرض جديد'}
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
                  عنوان المعرض *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أدخل عنوان المعرض"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  وصف المعرض *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="اكتب وصفاً للمعرض"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  الصور
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                  >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600">
                      {uploading ? 'جاري رفع الصورة...' : 'انقر لرفع صورة'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    الصور المرفوعة ({formData.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl mb-1">🖼️</div>
                            <p className="text-xs text-gray-600 truncate px-2">
                              {image}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  {loading ? 'جاري الحفظ...' : (editingGallery ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Galleries List */}
      <div className="bg-white rounded-lg shadow-md">
        {galleries.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedGalleries.length === galleries.length}
                onChange={handleSelectAll}
                className="ml-2"
              />
              <span className="text-sm text-gray-600">
                تحديد الكل ({galleries.length} معرض)
              </span>
            </label>
          </div>
        )}

        {galleries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">🖼️</div>
            <p>لا توجد معارض صور متاحة</p>
            <p className="text-sm mt-2">ابدأ بإضافة معرض صور جديد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {galleries.map((gallery) => (
              <div key={gallery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={selectedGalleries.includes(gallery.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGalleries([...selectedGalleries, gallery.id])
                      } else {
                        setSelectedGalleries(selectedGalleries.filter(id => id !== gallery.id))
                      }
                    }}
                    className="ml-2"
                  />
                  <h3 className="text-lg font-semibold text-palestine-black">
                    {gallery.title}
                  </h3>
                </div>

                <div className="aspect-video bg-gradient-to-br from-olive-200 to-olive-300 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center text-olive-700">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-sm">
                      {gallery.images?.length || 0} صورة
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {gallery.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {gallery.images?.length || 0} صورة
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(gallery)}
                      className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(gallery.id)}
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

export default AdminGallery
