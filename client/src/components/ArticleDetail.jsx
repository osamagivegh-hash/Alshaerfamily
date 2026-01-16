import React, { useMemo, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import FullPostLayout from './common/FullPostLayout'
import NotFound from './common/NotFound'
import ImageWithFallback from './common/ImageWithFallback'
import { normalizeImageUrl } from '../utils/imageUtils'
import Comments from './common/Comments'
import { api, fetchSectionData } from '../utils/api'

const ArticleDetail = () => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    let isMounted = true
    const fetchArticle = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/articles/${id}`)
        const apiArticle = response.data?.data || response.data
        if (apiArticle && isMounted) {
          const normalized = {
            ...apiArticle,
            id: apiArticle.id || apiArticle._id?.toString() || id
          }
          setArticle(normalized)
        }
        if (!apiArticle && isMounted) {
          setArticle(null)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
        if (isMounted) {
          setArticle(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchArticle()

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    let isMounted = true
    const fetchRelated = async () => {
      if (!article) {
        if (isMounted) setRelatedArticles([])
        return
      }
      try {
        const data = await fetchSectionData('articles')
        const list = Array.isArray(data) ? data : []
        const currentId = article.id || article._id?.toString()
        const filtered = list
          .filter(item => {
            const itemId = item.id || item._id?.toString()
            return itemId && itemId !== currentId
          })
          .slice(0, 3)
        if (isMounted) setRelatedArticles(filtered)
      } catch (error) {
        console.error('Error fetching related articles:', error)
        if (isMounted) setRelatedArticles([])
      }
    }

    fetchRelated()
    return () => {
      isMounted = false
    }
  }, [article])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المقال...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <NotFound
        title="المقال غير متوفر"
        message="نعتذر، لم نتمكن من العثور على المقال المطلوب."
        backLink="/#articles"
        backLabel="العودة إلى المقالات"
        icon="📄"
      />
    )
  }

  const readingTime = article.readingTime || Math.max(3, Math.ceil(article.content.split(/\s+/).length / 200))

  const articleId = article.id || article._id?.toString() || id

  const relatedSection = (
    <>
      {relatedArticles.length > 0 && (
        <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-palestine-black mb-6">مقالات ذات صلة</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id || relatedArticle._id}
                to={`/articles/${relatedArticle.id || relatedArticle._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 block"
              >
                <h3 className="font-bold text-palestine-black mb-2 line-clamp-2">
                  {relatedArticle.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(relatedArticle.date).toLocaleDateString('ar-SA')}
                </p>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {(relatedArticle.summary || relatedArticle.content || '').slice(0, 120)}...
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Comments contentType="article" contentId={articleId} />
    </>
  )

  return (
    <FullPostLayout
      type="article"
      backLink="/#articles"
      backLabel="العودة إلى المقالات"
      category="مقال"
      title={article.title}
      date={article.date}
      author={article.author}
      authorRole={article.authorRole}
      authorImage={article.authorImage}
      readingTime={readingTime}
      coverImage={normalizeImageUrl(article.image)}
      coverAlt={article.title}
      tags={article.tags}
      metaTitle={`${article.title} | مقالات عائلة الشاعر`}
      metaDescription={article.summary}
      metaImage={normalizeImageUrl(article.image)}
      afterArticle={relatedSection}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => (
            <ImageWithFallback
              src={normalizeImageUrl(src)}
              alt={alt || 'صورة'}
              containerClassName="my-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden"
              imgClassName="w-full h-auto max-w-full"
              objectFit="contain"
              enableLightbox={true}
            />
          ),
          p: ({ children }) => (
            <p className="mb-6 leading-loose text-gray-700 text-lg">{children}</p>
          ),
          strong: ({ children }) => <strong className="text-gray-900 font-bold">{children}</strong>,
          em: ({ children }) => <em className="text-gray-600 italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-palestine-green bg-gradient-to-l from-gray-50 to-white py-6 px-8 my-8 rounded-xl shadow-sm">
              {children}
            </blockquote>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-10 mb-6 pb-3 border-b border-gray-100">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h3>
          ),
          ul: ({ children }) => <ul className="list-disc mr-6 my-6 space-y-3 text-gray-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal mr-6 my-6 space-y-3 text-gray-700">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} className="text-palestine-green font-medium hover:text-olive-700 underline decoration-2 underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {article.content}
      </ReactMarkdown>
    </FullPostLayout>
  )
}

export default ArticleDetail