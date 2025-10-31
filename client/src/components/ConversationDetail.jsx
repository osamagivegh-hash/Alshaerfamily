import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { api } from '../utils/api'

const ConversationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedConversations, setRelatedConversations] = useState([])

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/conversations/${id}`)
        setConversation(response.data)
        
        // Fetch related conversations
        const allConversationsResponse = await api.get('/conversations')
        const related = allConversationsResponse.data
          .filter(c => c.id !== parseInt(id))
          .slice(0, 3)
        setRelatedConversations(related)
      } catch (err) {
        setError('فشل في تحميل الحوار')
        console.error('Error fetching conversation:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchConversation()
    }
  }, [id])

  const formatContent = (content) => {
    if (!content) return ''
    
    // Handle dialogue formatting
    return content
      .replace(/\n\n/g, '\n\n')
      .replace(/^([^:]+):/gm, '**$1:**') // Bold speaker names
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
          <p className="text-gray-600">جاري تحميل الحوار...</p>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">💬</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">الحوار غير موجود</h1>
          <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على الحوار المطلوب'}</p>
          <Link 
            to="/#conversations" 
            className="btn-primary inline-block"
          >
            العودة إلى الحوارات
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
              to="/#conversations" 
              className="flex items-center text-palestine-green hover:text-olive-700 transition-colors"
            >
              <span className="ml-2">←</span>
              العودة إلى الحوارات
            </Link>
            <Link to="/" className="text-xl font-bold text-palestine-black">
              عائلة الشاعر
            </Link>
          </nav>
        </div>
      </header>

      {/* Conversation Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Conversation Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="mb-4">
              <span className="bg-olive-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                حوار
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-palestine-black mb-6 leading-tight">
              {conversation.title}
            </h1>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-palestine-green mb-3">المشاركون في الحوار:</h3>
              <div className="flex flex-wrap gap-3">
                {conversation.participants?.map((participant, index) => (
                  <div key={index} className="flex items-center bg-olive-50 rounded-lg p-3">
                    <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white font-bold ml-3">
                      {participant.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-palestine-black">{participant}</p>
                      <p className="text-sm text-gray-500">عضو العائلة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600">
              <div className="text-sm mb-2 sm:mb-0">
                <p>{new Date(conversation.date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="text-gray-500">مدة القراءة: {Math.ceil(conversation.content?.length / 800) || 10} دقائق</p>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-palestine-green text-white px-4 py-2 rounded-lg text-sm hover:bg-olive-700 transition-colors">
                  🎧 استمع للحوار
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  📄 تحميل النص
                </button>
              </div>
            </div>

            {/* Conversation Image if exists */}
            {conversation.image && (
              <div className="mt-6">
                <img 
                  src={conversation.image} 
                  alt={conversation.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={handleImageError}
                />
              </div>
            )}
          </div>

          {/* Conversation Body */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-palestine-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-palestine-green">
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
                    <p className="mb-4 text-gray-700 leading-relaxed text-lg dialogue-text">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-palestine-green font-bold">
                      {children}
                    </strong>
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
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-olive-400 bg-olive-50 p-4 my-6 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {formatContent(conversation.content)}
              </ReactMarkdown>
            </div>
          </div>

          {/* Conversation Footer */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-600">شارك هذا الحوار:</p>
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
                <p>تم التسجيل في {new Date(conversation.date).toLocaleDateString('ar-SA')}</p>
                {conversation.updatedAt && (
                  <p>آخر تحديث: {new Date(conversation.updatedAt).toLocaleDateString('ar-SA')}</p>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Conversations */}
        {relatedConversations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-palestine-black mb-6">حوارات ذات صلة</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedConversations.map((relatedConversation) => (
                <Link
                  key={relatedConversation.id}
                  to={`/conversations/${relatedConversation.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="font-bold text-palestine-black mb-2 line-clamp-2">
                      {relatedConversation.title}
                    </h3>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">المشاركون:</p>
                      <div className="flex flex-wrap gap-1">
                        {relatedConversation.participants?.slice(0, 2).map((participant, index) => (
                          <span key={index} className="bg-olive-100 text-olive-800 px-2 py-1 rounded text-xs">
                            {participant}
                          </span>
                        ))}
                        {relatedConversation.participants?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{relatedConversation.participants.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {relatedConversation.content?.substring(0, 120)}...
                    </p>
                    <div className="mt-4 text-olive-600 text-sm font-medium">
                      استمع للحوار ←
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

export default ConversationDetail
