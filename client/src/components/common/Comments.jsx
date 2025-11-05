import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

const Comments = ({ contentType, contentId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    comment: ''
  })
  const [showForm, setShowForm] = useState(false)

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${contentType}/${contentId}`)
        // Extract data from nested response structure: { success, message, data, timestamp }
        const commentsData = response.data?.data || response.data || []
        setComments(Array.isArray(commentsData) ? commentsData : [])
      } catch (error) {
        console.error('Error fetching comments:', error)
        // Fallback to empty array if API fails
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    if (contentId) {
      fetchComments()
    }
  }, [contentType, contentId])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.name.trim() || !newComment.comment.trim()) {
      toast.error('الرجاء إدخال الاسم والتعليق')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/comments', {
        contentType,
        contentId,
        name: newComment.name.trim(),
        email: newComment.email.trim(),
        comment: newComment.comment.trim(),
        approved: false // Comments need approval
      })

      // Add new comment to list (optimistically)
      setComments([...comments, {
        ...response.data,
        id: response.data._id || response.data.id,
        createdAt: new Date().toISOString()
      }])

      // Reset form
      setNewComment({ name: '', email: '', comment: '' })
      setShowForm(false)
      toast.success('تم إرسال تعليقك بنجاح! سيتم مراجعته قبل النشر.')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('فشل إرسال التعليق. الرجاء المحاولة مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const approvedComments = comments.filter(c => c.approved !== false)

  return (
    <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-palestine-black">
          التعليقات ({approvedComments.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? 'إلغاء' : 'إضافة تعليق'}
        </button>
      </div>

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <label htmlFor="comment-name" className="block text-sm font-medium text-palestine-black mb-2">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="comment-name"
              value={newComment.name}
              onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
              placeholder="أدخل اسمك"
              required
              dir="rtl"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="comment-email" className="block text-sm font-medium text-palestine-black mb-2">
              البريد الإلكتروني (اختياري)
            </label>
            <input
              type="email"
              id="comment-email"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="comment-text" className="block text-sm font-medium text-palestine-black mb-2">
              التعليق <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment-text"
              value={newComment.comment}
              onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
              placeholder="اكتب تعليقك هنا..."
              required
              dir="rtl"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'جاري الإرسال...' : 'إرسال التعليق'}
          </button>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palestine-green mx-auto mb-2"></div>
          <p className="text-gray-600">جاري تحميل التعليقات...</p>
        </div>
      ) : approvedComments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">لا توجد تعليقات حتى الآن.</p>
          <p className="text-sm">كن أول من يعلق!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvedComments.map((comment) => (
            <div
              key={comment.id || comment._id}
              className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-palestine-green text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {comment.name?.charAt(0)?.toUpperCase() || 'ع'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-palestine-black">{comment.name}</h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt || comment.date)}
                    </span>
                  </div>
                  {comment.email && (
                    <p className="text-sm text-gray-500 mb-2">{comment.email}</p>
                  )}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Comments
