import React, { useState, useEffect, useRef, useMemo } from 'react'
import { adminPalestine } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadEditorImage } from './EditorImageUploader';

const AdminPalestine = () => {
  const [palestineItems, setPalestineItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: ''
  })

  const editorRef = useRef(null)

  const imageLimit = 20
  const modules = useMemo(() => ({
    toolbar: {
      container: [[{ header: [1, 2, false] }], ['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean']],
      handlers: {
        image: function () {
          const quill = this.quill
          const currentImages = quill?.root?.querySelectorAll('img')?.length || 0
          if (currentImages >= imageLimit) {
            toast.error('لا يمكن إضافة أكثر من 20 صورة داخل المحتوى.')
            return
          }

          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.click()
          input.onchange = async () => {
            const file = input.files && input.files[0]
            if (!file) return

            try {
              const url = await uploadEditorImage(file)
              const selection = quill.getSelection(true)
              const index = selection ? selection.index : quill.getLength()
              quill.insertEmbed(index, 'image', url)
              quill.setSelection(index + 1)
              quill.focus()
            } catch (error) {
              console.error('Image upload failed:', error)
              toast.error('فشل رفع الصورة. حاول مرة أخرى.')
            }
          }
        }
      }
    }
  }), [imageLimit])

  useEffect(() => {
    fetchPalestineItems()
  }, [])

  const fetchPalestineItems = async () => {
    try {
      const data = await adminPalestine.getAll()
      setPalestineItems(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setPalestineItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingItem) {
        await adminPalestine.update(editingItem.id, formData)
        toast.success('تم تحديث المحتوى بنجاح')
      } else {
        await adminPalestine.create(formData)
        toast.success('تم إضافة المحتوى بنجاح')
      }
      
      setShowForm(false)
      setEditingItem(null)
      setFormData({
        title: '',
        content: '',
        image: ''
      })
      fetchPalestineItems()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      image: item.image || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return

    try {
      await adminPalestine.delete(id)
      toast.success('تم حذف المحتوى بنجاح')
      fetchPalestineItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('يرجى اختيار عناصر للحذف')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedItems.length} عنصر؟`)) return

    try {
      await adminPalestine.bulkDelete(selectedItems)
      toast.success(`تم حذف ${selectedItems.length} عنصر بنجاح`)
      setSelectedItems([])
      fetchPalestineItems()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === palestineItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(palestineItems.map(item => item.id))
    }
  }

  if (loading && !showForm) {
    return <LoadingSpinner />
  }

  const contentImageCount = (formData.content.match(/<img/gi) || []).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-palestine-black">إدارة قسم فلسطين</h1>
          <p className="text-gray-600 mt-1">إدارة المحتوى المتعلق بفلسطين والتراث الفلسطيني</p>
        </div>
        <div className="flex gap-4">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              حذف المحدد ({selectedItems.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true)
              setEditingItem(null)
              setFormData({
                title: '',
                content: '',
                image: ''
              })
            }}
            className="btn-primary"
          >
            إضافة محتوى جديد
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-palestine-black">
                {editingItem ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
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
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أدخل عنوان المحتوى"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">المحتوى *</label>
                <ReactQuill
                  ref={editorRef}
                  className="rich-text-editor"
                  value={formData.content}
                  onChange={content => setFormData({...formData, content})}
                  modules={modules}
                  theme="snow"
                  placeholder="اكتب المحتوى الخاص بالقسم ويمكنك إدراج صور متعددة داخل النص..."
                />
                <div className="text-xs mt-1">عدد الصور المدرجة: {contentImageCount}/{imageLimit} (الحد الأقصى 20).</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  اسم الصورة (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="form-input"
                  placeholder="مثال: palestine-jerusalem.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  اتركه فارغاً إذا لم تكن هناك صورة محددة
                </p>
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
                  {loading ? 'جاري الحفظ...' : (editingItem ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Palestine Flag Colors Banner */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center mb-4">
          <div className="flex rounded-lg overflow-hidden shadow-lg">
            <div className="w-16 h-8 bg-palestine-black"></div>
            <div className="w-16 h-8 bg-palestine-white border-t border-b border-gray-300"></div>
            <div className="w-16 h-8 bg-palestine-green"></div>
            <div className="w-16 h-8 bg-palestine-red"></div>
          </div>
        </div>
        <p className="text-center text-gray-600">
          محتوى مخصص للتراث الفلسطيني وذكريات الوطن
        </p>
      </div>

      {/* Palestine Items List */}
      <div className="bg-white rounded-lg shadow-md">
        {palestineItems.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === palestineItems.length}
                onChange={handleSelectAll}
                className="ml-2"
              />
              <span className="text-sm text-gray-600">
                تحديد الكل ({palestineItems.length} عنصر)
              </span>
            </label>
          </div>
        )}

        {palestineItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">🏛️</div>
            <p>لا يوجد محتوى فلسطيني متاح</p>
            <p className="text-sm mt-2">ابدأ بإضافة محتوى عن التراث الفلسطيني</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {palestineItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id])
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id))
                        }
                      }}
                      className="ml-3 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-palestine-black ml-2">
                          {item.title}
                        </h3>
                        {item.image && (
                          <span className="bg-palestine-green text-white px-2 py-1 rounded text-xs">
                            صورة
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {item.content.substring(0, 200)}...
                      </p>
                      {item.image && (
                        <p className="text-sm text-palestine-green mt-2">
                          📷 {item.image}
                        </p>
                      )}
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <span>{item.content.length} حرف</span>
                        {item.createdAt && (
                          <>
                            <span className="mx-2">•</span>
                            <span>أُضيف في {new Date(item.createdAt).toLocaleDateString('ar-SA')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mr-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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

      {/* Palestine Quote */}
      <div className="bg-gradient-to-r from-olive-100 to-palestine-green/10 p-6 rounded-lg text-center">
        <blockquote className="text-xl font-bold text-palestine-black mb-2">
          "فلسطين ليست مجرد أرض، بل هي الهوية والذاكرة والحلم الذي نحمله في قلوبنا"
        </blockquote>
        <cite className="text-olive-700 font-medium">
          - من أقوال أجدادنا
        </cite>
      </div>
    </div>
  )
}

export default AdminPalestine
