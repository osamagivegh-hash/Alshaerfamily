import React, { useState, useEffect, useRef, useMemo } from 'react'
import { adminConversations } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'
import ImageUpload from './ImageUpload'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadEditorImage } from './EditorImageUploader';

const formatDateForInput = (value) => {
  if (!value) return new Date().toISOString().split('T')[0]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  return date.toISOString().split('T')[0]
}

const AdminConversations = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversations, setSelectedConversations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingConversation, setEditingConversation] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    participants: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    summary: '',
    moderator: '',
    moderatorRole: '',
    moderatorImage: '',
    tags: []
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
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const data = await adminConversations.getAll()
      setConversations(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const conversationData = {
        ...formData,
        participants: formData.participants.split(',').map(p => p.trim()).filter(p => p)
      }

      if (editingConversation) {
        await adminConversations.update(editingConversation.id, conversationData)
        toast.success('تم تحديث الحوار بنجاح')
      } else {
        await adminConversations.create(conversationData)
        toast.success('تم إضافة الحوار بنجاح')
      }
      
      setShowForm(false)
      setEditingConversation(null)
      setFormData({
        title: '',
        participants: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        image: '',
        summary: '',
        moderator: '',
        moderatorRole: '',
        moderatorImage: '',
        tags: []
      })
      fetchConversations()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (conversation) => {
    setEditingConversation(conversation)
    setFormData({
      title: conversation.title || '',
      participants: Array.isArray(conversation.participants) 
        ? conversation.participants.join(', ') 
        : conversation.participants || '',
      content: conversation.content || '',
      date: formatDateForInput(conversation.date),
      image: conversation.image || '',
      summary: conversation.summary || '',
      moderator: conversation.moderator || '',
      moderatorRole: conversation.moderatorRole || '',
      moderatorImage: conversation.moderatorImage || '',
      tags: Array.isArray(conversation.tags) ? conversation.tags : []
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحوار؟')) return

    try {
      await adminConversations.delete(id)
      toast.success('تم حذف الحوار بنجاح')
      fetchConversations()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedConversations.length === 0) {
      toast.error('يرجى اختيار عناصر للحذف')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedConversations.length} حوار؟`)) return

    try {
      await adminConversations.bulkDelete(selectedConversations)
      toast.success(`تم حذف ${selectedConversations.length} حوار بنجاح`)
      setSelectedConversations([])
      fetchConversations()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectAll = () => {
    if (selectedConversations.length === conversations.length) {
      setSelectedConversations([])
    } else {
      setSelectedConversations(conversations.map(item => item.id))
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
        <h1 className="text-2xl font-bold text-palestine-black">إدارة الحوارات</h1>
        <div className="flex gap-4">
          {selectedConversations.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              حذف المحدد ({selectedConversations.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true)
              setEditingConversation(null)
              setFormData({
                title: '',
                participants: '',
                content: '',
                date: new Date().toISOString().split('T')[0],
                image: '',
                summary: '',
                moderator: '',
                moderatorRole: '',
                moderatorImage: '',
                tags: []
              })
            }}
            className="btn-primary"
          >
            إضافة حوار جديد
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-palestine-black">
                {editingConversation ? 'تعديل الحوار' : 'إضافة حوار جديد'}
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
                  عنوان الحوار *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أدخل عنوان الحوار"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="صورة الحوار"
                value={formData.image}
                onChange={(url) => setFormData({...formData, image: url})}
              />

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  ملخص الحوار
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={3}
                  className="form-textarea"
                  placeholder="ملخص قصير للحوار"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  المشاركون *
                </label>
                <input
                  type="text"
                  value={formData.participants}
                  onChange={(e) => setFormData({...formData, participants: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أسماء المشاركين مفصولة بفواصل (مثال: أحمد الشاعر, فاطمة الشاعر)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    مُيسّر الحوار
                  </label>
                  <input
                    type="text"
                    value={formData.moderator}
                    onChange={(e) => setFormData({...formData, moderator: e.target.value})}
                    className="form-input"
                    placeholder="اسم مُيسّر الحوار"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-palestine-black mb-2">
                    دور المُيسّر
                  </label>
                  <input
                    type="text"
                    value={formData.moderatorRole}
                    onChange={(e) => setFormData({...formData, moderatorRole: e.target.value})}
                    className="form-input"
                    placeholder="مثال: مُيسّر الحوار"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  محتوى الحوار *
                </label>
                <ReactQuill
                  ref={editorRef}
                  className="rich-text-editor"
                  value={formData.content}
                  onChange={content => setFormData({...formData, content})}
                  modules={modules}
                  theme="snow"
                  placeholder="اكتب محتوى الحوار بالتفصيل، ويمكنك إدراج الصور المساندة..."
                />
                <div className="text-xs mt-1">عدد الصور المدرجة: {contentImageCount}/{imageLimit} (الحد الأقصى 20).</div>
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
                  {loading ? 'جاري الحفظ...' : (editingConversation ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow-md">
        {conversations.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedConversations.length === conversations.length}
                onChange={handleSelectAll}
                className="ml-2"
              />
              <span className="text-sm text-gray-600">
                تحديد الكل ({conversations.length} حوار)
              </span>
            </label>
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد حوارات متاحة
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedConversations.includes(conversation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConversations([...selectedConversations, conversation.id])
                        } else {
                          setSelectedConversations(selectedConversations.filter(id => id !== conversation.id))
                        }
                      }}
                      className="ml-3"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-palestine-black">
                        {conversation.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {conversation.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>المشاركون: {Array.isArray(conversation.participants) 
                          ? conversation.participants.join(', ') 
                          : conversation.participants}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(conversation.date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(conversation)}
                      className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(conversation.id)}
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

export default AdminConversations
