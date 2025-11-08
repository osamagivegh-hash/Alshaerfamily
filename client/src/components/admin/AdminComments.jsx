import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'
import { adminComments } from '../../utils/adminApi'

const typeLabels = {
  article: 'مقال',
  news: 'خبر',
  conversation: 'حوار'
}

const getContentLink = (type, id) => {
  if (!id) return '#'
  switch (type) {
    case 'article':
      return `/articles/${id}`
    case 'news':
      return `/news/${id}`
    case 'conversation':
      return `/conversations/${id}`
    default:
      return '#'
  }
}

const AdminComments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  const fetchComments = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterType !== 'all') params.contentType = filterType
      const data = await adminComments.getAll(params)
      const normalized = Array.isArray(data)
        ? data.map(item => ({
            id: item.id || item._id,
            contentType: item.contentType,
            contentId: item.contentId,
            name: item.name,
            email: item.email,
            comment: item.comment,
            approved: item.approved,
            createdAt: item.createdAt
          }))
        : []
      setComments(normalized)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      toast.error(error.message || 'فشل في جلب التعليقات')
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType])

  const handleDelete = async (id) => {
    if (!id) return
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return

    try {
      await adminComments.delete(id)
      toast.success('تم حذف التعليق بنجاح')
      setComments(prev => prev.filter(comment => comment.id !== id))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(error.message || 'فشل في حذف التعليق')
    }
  }

  const filteredComments = useMemo(() => {
    if (filterType === 'all') return comments
    return comments.filter(comment => comment.contentType === filterType)
  }, [comments, filterType])

  const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-palestine-black">إدارة التعليقات</h1>
          <p className="text-sm text-gray-600 mt-1">عرض وحذف التعليقات المضافة على المقالات والأخبار والحوارات</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">تصفية حسب النوع:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input max-w-xs"
          >
            <option value="all">الكل</option>
            <option value="article">المقالات</option>
            <option value="news">الأخبار</option>
            <option value="conversation">الحوارات</option>
          </select>
        </div>
      </div>

      {filteredComments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          لا توجد تعليقات متاحة حالياً.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الاسم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">التعليق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">نوع المحتوى</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-palestine-black">{comment.name || 'غير معروف'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {comment.email ? (
                        <a href={`mailto:${comment.email}`} className="hover:underline">
                          {comment.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md whitespace-pre-wrap">
                      {comment.comment}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-medium">{typeLabels[comment.contentType] || comment.contentType || '—'}</span>
                        {comment.contentId && (
                          <Link
                            to={getContentLink(comment.contentType, comment.contentId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-palestine-green text-xs hover:underline"
                          >
                            عرض المحتوى ↗
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="px-3 py-1 text-sm text-white bg-palestine-red rounded hover:bg-red-700 transition-colors"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminComments
