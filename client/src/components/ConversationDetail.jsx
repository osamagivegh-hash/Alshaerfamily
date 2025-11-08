import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import FullPostLayout from './common/FullPostLayout'
import NotFound from './common/NotFound'
import ImageWithFallback from './common/ImageWithFallback'
import { normalizeImageUrl } from '../utils/imageUtils'
import Comments from './common/Comments'
import { api } from '../utils/api'

const ConversationDetail = () => {
  const { id } = useParams()
  const [conversation, setConversation] = useState(null)
  const [relatedConversations, setRelatedConversations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let isMounted = true
    const fetchConversation = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/conversations/${id}`)
        const apiConversation = response.data?.data || response.data
        if (apiConversation && isMounted) {
          const normalized = {
            ...apiConversation,
            id: apiConversation.id || apiConversation._id?.toString() || id
          }
          setConversation(normalized)
        }
        if (!apiConversation && isMounted) {
          setConversation(null)
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
        if (isMounted) {
          setConversation(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchConversation()

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    let isMounted = true
    const fetchRelated = async () => {
      if (!conversation) {
        if (isMounted) setRelatedConversations([])
        return
      }
      try {
        const response = await api.get('/sections/conversations')
        const data = response.data?.data || response.data || []
        const list = Array.isArray(data) ? data : []
        const currentId = conversation.id || conversation._id?.toString()
        const related = list
          .filter(item => {
            const itemId = item.id || item._id?.toString()
            return itemId && itemId !== currentId
          })
          .slice(0, 3)
        if (isMounted) setRelatedConversations(related)
      } catch (error) {
        console.error('Error fetching related conversations:', error)
        if (isMounted) setRelatedConversations([])
      }
    }

    fetchRelated()
    return () => {
      isMounted = false
    }
  }, [conversation])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الحوار...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <NotFound
        title="الحوار غير متوفر"
        message="لم نتمكن من العثور على الحوار الذي تبحث عنه."
        backLink="/#conversations"
        backLabel="العودة إلى الحوارات"
        icon="💬"
      />
    )
  }

  const readingTime = Math.max(4, Math.ceil((conversation.content || '').split(/\s+/).length / 180))

  const conversationId = conversation.id || conversation._id?.toString() || id

  const participantsSection = (
    <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-palestine-green mb-3">المشاركون في الحوار</h3>
      <div className="flex flex-wrap gap-3">
        {conversation.participants?.map((participant) => (
          <span key={participant} className="bg-olive-100 text-olive-800 px-3 py-1 rounded-full text-sm">
            {participant}
          </span>
        ))}
      </div>
    </section>
  )

  const relatedSection = (
    <>
      {relatedConversations.length > 0 && (
        <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-palestine-black mb-6">حوارات ذات صلة</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedConversations.map((relatedConversation) => (
              <Link
                key={relatedConversation.id || relatedConversation._id}
                to={`/conversations/${relatedConversation.id || relatedConversation._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 block"
              >
                <h3 className="font-bold text-palestine-black mb-2 line-clamp-2">
                  {relatedConversation.title}
                </h3>
                <div className="flex flex-wrap gap-1 text-xs text-gray-500 mb-2">
                  {relatedConversation.participants?.slice(0, 3).map((participant) => (
                    <span key={participant} className="bg-gray-100 px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {(relatedConversation.summary || relatedConversation.content || '').slice(0, 120)}...
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Comments contentType="conversation" contentId={conversationId} />
    </>
  )

  return (
    <FullPostLayout
      type="dialogue"
      backLink="/#conversations"
      backLabel="العودة إلى الحوارات"
      category="حوار"
      title={conversation.title}
      date={conversation.date}
      author={conversation.moderator}
      authorRole={conversation.moderatorRole || 'مُيسّر الحوار'}
      authorImage={conversation.moderatorImage}
      readingTime={readingTime}
      coverImage={normalizeImageUrl(conversation.image)}
      coverAlt={conversation.title}
      tags={conversation.tags}
      metaTitle={`${conversation.title} | حوارات عائلة الشاعر`}
      metaDescription={conversation.summary}
      metaImage={normalizeImageUrl(conversation.image)}
      afterArticle={
        <>
          {participantsSection}
          {relatedSection}
        </>
      }
      shareLabel="شارك هذا الحوار:"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => (
            <ImageWithFallback
              src={normalizeImageUrl(src)}
              alt={alt || 'صورة'}
              containerClassName="my-4"
              imgClassName="w-full h-auto rounded-lg shadow-md"
            />
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-loose text-gray-700 dialogue-text">{children}</p>
          ),
          strong: ({ children }) => <strong className="text-palestine-green">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-olive-400 bg-olive-50 p-4 my-6 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {conversation.content}
      </ReactMarkdown>
    </FullPostLayout>
  )
}

export default ConversationDetail