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
import { getArticleById, getRelatedArticles } from '../data'
import { api } from '../utils/api'

const ArticleDetail = () => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        // Try API first
        try {
          const response = await api.get(`/articles/${id}`)
          const apiArticle = response.data
          // Normalize the article to have both id and _id
          if (apiArticle) {
            apiArticle.id = apiArticle.id || apiArticle._id?.toString() || id
            setArticle(apiArticle)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.log('API fetch failed, trying static data:', apiError)
        }
        
        // Fallback to static data
        const staticArticle = getArticleById(id)
        if (staticArticle) {
          setArticle(staticArticle)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [id])
  
  const relatedArticles = useMemo(() => {
    if (!article) return []
    return getRelatedArticles(article.id || id)
  }, [article, id])

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
                key={relatedArticle.id}
                to={`/articles/${relatedArticle.id}`}
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
              containerClassName="my-4"
              imgClassName="w-full h-auto rounded-lg shadow-md"
            />
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-loose text-gray-700">{children}</p>
          ),
          strong: ({ children }) => <strong className="text-palestine-black">{children}</strong>,
          em: ({ children }) => <em className="text-gray-600">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-palestine-green bg-gray-50 p-4 my-6 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {article.content}
      </ReactMarkdown>
    </FullPostLayout>
  )
}

export default ArticleDetail