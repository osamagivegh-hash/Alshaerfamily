import React, { useState, useEffect } from 'react'
import { adminArticles } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'
import ImageUpload from './ImageUpload'
import ImageWithFallback from '../common/ImageWithFallback'
import { normalizeImageUrl } from '../../utils/imageUtils'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadEditorImage } from './EditorImageUploader';

const AdminArticles = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticles, setSelectedArticles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    summary: '',
    tags: [],
    authorRole: '',
    authorImage: ''
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const data = await adminArticles.getAll()
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingArticle) {
        const articleId = editingArticle.id || editingArticle._id
        await adminArticles.update(articleId, formData)
        toast.success('تم تحديث المقال بنجاح')
      } else {
        await adminArticles.create(formData)
        toast.success('تم إضافة المقال بنجاح')
      }
      
      setShowForm(false)
      setEditingArticle(null)
      setFormData({
        title: '',
        author: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        image: '',
        summary: '',
        tags: [],
        authorRole: '',
        authorImage: ''
      })
      fetchArticles()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title || '',
      author: article.author || '',
      content: article.content || '',
      date: article.date || new Date().toISOString().split('T')[0],
      image: article.image || '',
      summary: article.summary || '',
      tags: Array.isArray(article.tags) ? article.tags : [],
      authorRole: article.authorRole || '',
      authorImage: article.authorImage || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return

    try {
      const articleId = typeof id === 'object' ? (id.id || id._id) : id
      await adminArticles.delete(articleId)
      toast.success('تم حذف المقال بنجاح')
      fetchArticles()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) {
      toast.error('يرجى اختيار عناصر للحذف')
      return
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedArticles.length} مقال؟`)) return

    try {
      await adminArticles.bulkDelete(selectedArticles)
      toast.success(`تم حذف ${selectedArticles.length} مقال بنجاح`)
      setSelectedArticles([])
      fetchArticles()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(articles.map(item => item.id || item._id))
    }
  }

  if (loading && !showForm) {
    return <LoadingSpinner />
  }

  const contentImageCount = (formData.content.match(/<img/gi) || []).length;
  const imageLimit = 20;

  const modules = {
    toolbar: {
      container: [[{ header: [1, 2, false] }], ['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean']],
      handlers: {
        image: function() {
          if (contentImageCount >= imageLimit) {
            toast.error('لا يمكن إضافة أكثر من 20 صورة داخل المحتوى.');
            return;
          }

          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            const file = input.files && input.files[0];
            if (file) {
              try {
                const url = await uploadEditorImage(file);
                const quill = this.quill;
                const range = quill.getSelection(true);
                quill.insertEmbed(range ? range.index : quill.getLength(), 'image', url);
              } catch (error) {
                console.error('Image upload failed:', error);
                toast.error('فشل رفع الصورة. حاول مرة أخرى.');
              }
            }
          };
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-palestine-black">إدارة المقالات</h1>
        <div className="flex gap-4">
          {selectedArticles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-palestine-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              حذف المحدد ({selectedArticles.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true)
              setEditingArticle(null)
              setFormData({
                title: '',
                author: '',
                content: '',
                date: new Date().toISOString().split('T')[0],
                image: '',
                summary: '',
                tags: [],
                authorRole: '',
                authorImage: ''
              })
            }}
            className="btn-primary"
          >
            إضافة مقال جديد
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-palestine-black">
                {editingArticle ? 'تعديل المقال' : 'إضافة مقال جديد'}
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
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="أدخل عنوان المقال"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="صورة المقال"
                value={formData.image}
                onChange={(url) => setFormData({...formData, image: url})}
              />

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">
                  ملخص المقال
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={3}
                  className="form-textarea"
                  placeholder="ملخص قصير للمقال"
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
                    placeholder="اسم كاتب المقال"
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

              <div>
                <label className="block text-sm font-medium text-palestine-black mb-2">محتوى المقال *</label>
                <ReactQuill
                  className="rich-text-editor"
                  value={formData.content}
                  onChange={content => setFormData({...formData, content})}
                  modules={modules}
                  theme="snow"
                  placeholder="اكتب محتوى المقال، ويمكنك إدراج الصور والنصوص المنسقة هنا..."
                />
                <div className="text-xs mt-1">عدد الصور المدرجة: {contentImageCount}/{imageLimit} (الحد الأقصى 20).</div>
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
                  {loading ? 'جاري الحفظ...' : (editingArticle ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-md">
        {articles.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedArticles.length === articles.length}
                onChange={handleSelectAll}
                className="ml-2"
              />
              <span className="text-sm text-gray-600">
                تحديد الكل ({articles.length} مقال)
              </span>
            </label>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد مقالات متاحة
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {articles.map((article) => {
              const articleId = article.id || article._id
              return (
              <div key={articleId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(articleId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArticles([...selectedArticles, articleId])
                        } else {
                          setSelectedArticles(selectedArticles.filter(id => id !== articleId))
                        }
                      }}
                      className="ml-3"
                    />
                    {article.image && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <ImageWithFallback
                          src={normalizeImageUrl(article.image)}
                          alt={article.title}
                          containerClassName="w-full h-full"
                          imgClassName="w-full h-full object-cover"
                          fallbackIcon="📄"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-palestine-black">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {article.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>بواسطة: {article.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(article.date).toLocaleDateString('ar-SA')}</span>
                        <span className="mx-2">•</span>
                        <span>{article.content?.length || 0} حرف</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(articleId)}
                      className="bg-palestine-red text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminArticles
