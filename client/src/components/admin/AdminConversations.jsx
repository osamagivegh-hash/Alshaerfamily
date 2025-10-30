import React, { useState, useEffect } from 'react'
import { adminConversations } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

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
    date: new Date().toISOString().split('T')[0]
  })

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
        date: new Date().toISOString().split('T')[0]
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
      title: conversation.title,
      participants: Array.isArray(conversation.participants) 
        ? conversation.participants.join(', ') 
        : conversation.participants || '',
      content: conversation.content,
      date: conversation.date
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
                date: new Date().toISOString().split('T')[0]
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
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

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  محتوى الحوار *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={5}
                  className="form-textarea"
                  placeholder="اكتب محتوى الحوار"
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
