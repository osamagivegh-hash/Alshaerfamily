import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { api } from '../utils/api'

const ArticleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/articles/${id}`)
        setArticle(response.data)
        
        // Fetch related articles
        const allArticlesResponse = await api.get('/articles')
        const related = allArticlesResponse.data
          .filter(a => a.id !== parseInt(id))
          .slice(0, 3)
        setRelatedArticles(related)
      } catch (err) {
        setError('فشل في تحميل المقال')
        console.error('Error fetching article:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchArticle()
    }
  }, [id])

  const formatContent = (content) => {
    if (!content) return ''
    
    // Handle line breaks and preserve formatting
    return content
      .replace(/\n\n/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      .replace(/\*(.*?)\*/g, '*$1*')
  }

  const handleImageError = (e) => {
    e.target.style.display = 'none'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المقال...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">المقال غير موجود</h1>
          <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على المقال المطلوب'}</p>
          <Link 
            to="/#articles" 
            className="btn-primary inline-block"
          >
            العودة إلى المقالات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link 
              to="/#articles" 
              className="flex items-center text-palestine-green hover:text-olive-700 transition-colors"
            >
              <span className="ml-2">←</span>
              العودة إلى المقالات
            </Link>
            <Link to="/" className="text-xl font-bold text-palestine-black">
              عائلة الشاعر
            </Link>
          </nav>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="mb-4">
              <span className="bg-palestine-green text-white px-3 py-1 rounded-full text-sm font-medium">
                مقال
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-palestine-black mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 mb-6">
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="w-10 h-10 bg-palestine-green rounded-full flex items-center justify-center text-white font-bold ml-3">
                  {article.author?.charAt(0) || 'م'}
                </div>
                <div>
                  <p className="font-semibold text-palestine-black">{article.author}</p>
                  <p className="text-sm text-gray-500">كاتب</p>
                </div>
              </div>
              
              <div className="text-sm">
                <p>{new Date(article.date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="text-gray-500">وقت القراءة: {Math.ceil(article.content?.length / 1000) || 5} دقائق</p>
              </div>
            </div>

            {/* Article Image if exists */}
            {article.image && (
              <div className="mb-6">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={handleImageError}
                />
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-palestine-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-palestine-black prose-a:text-palestine-green hover:prose-a:text-olive-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ src, alt, ...props }) => (
                    <img 
                      src={src} 
                      alt={alt || 'صورة'} 
                      className="rounded-lg shadow-md max-w-full h-auto"
                      onError={handleImageError}
                      {...props}
                    />
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-gray-700 leading-relaxed text-lg">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-palestine-black mb-6 mt-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-palestine-black mb-4 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-palestine-black mb-3 mt-5">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-palestine-green bg-gray-50 p-4 my-6 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {formatContent(article.content)}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-600">شارك هذا المقال:</p>
                <div className="flex gap-2 mt-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                    فيسبوك
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    واتساب
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                    نسخ الرابط
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>تم النشر في {new Date(article.date).toLocaleDateString('ar-SA')}</p>
                {article.updatedAt && (
                  <p>آخر تحديث: {new Date(article.updatedAt).toLocaleDateString('ar-SA')}</p>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-palestine-black mb-6">مقالات ذات صلة</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/articles/${relatedArticle.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="font-bold text-palestine-black mb-2 line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      بقلم: {relatedArticle.author}
                    </p>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {relatedArticle.content?.substring(0, 120)}...
                    </p>
                    <div className="mt-4 text-palestine-green text-sm font-medium">
                      اقرأ المزيد ←
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default ArticleDetail
