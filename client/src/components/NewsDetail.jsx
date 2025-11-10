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
import { NEWS_CATEGORY_LABELS, resolveNewsCategory } from '../constants/newsCategories'

const NewsDetail = () => {
  const { id } = useParams()
  const [newsItem, setNewsItem] = useState(null)
  const [relatedNews, setRelatedNews] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let isMounted = true
    const fetchNews = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/news/${id}`)
        const apiNews = response.data?.data || response.data
        if (apiNews && isMounted) {
          const normalized = {
            ...apiNews,
            id: apiNews.id || apiNews._id?.toString() || id
          }
          setNewsItem(normalized)
          // Fetch related news items
          try {
            const allNewsResponse = await api.get('/sections/news')
            const allNewsData = allNewsResponse.data?.data || allNewsResponse.data || []
            const allNews = Array.isArray(allNewsData) ? allNewsData : []
            const currentCategory = resolveNewsCategory(normalized.category)
            const related = allNews
              .filter(item => {
                const itemId = item.id || item._id?.toString()
                if (!itemId || itemId === normalized.id) return false
                if (!currentCategory) return true
                return resolveNewsCategory(item.category) === currentCategory
              })
              .slice(0, 3)
            if (isMounted) setRelatedNews(related)
          } catch (relatedError) {
            console.error('Failed to fetch related news from API:', relatedError)
            if (isMounted) setRelatedNews([])
          }
        }
        if (!apiNews && isMounted) {
          setNewsItem(null)
          setRelatedNews([])
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        if (isMounted) {
          setNewsItem(null)
          setRelatedNews([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchNews()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الخبر...</p>
        </div>
      </div>
    )
  }

  if (!newsItem) {
    return (
      <NotFound
        title="الخبر غير متوفر"
        message="يبدو أن الخبر الذي تحاول الوصول إليه غير موجود أو تمت إزالته."
        backLink="/#news"
        backLabel="العودة إلى الأخبار"
        icon="📰"
      />
    )
  }

  const readingTime = Math.max(3, Math.ceil((newsItem.content || '').split(/\s+/).length / 220))

  const newsId = newsItem.id || newsItem._id?.toString() || id
  const categorySlug = resolveNewsCategory(newsItem.category)
  const categoryLabel = categorySlug ? NEWS_CATEGORY_LABELS[categorySlug] : 'خبر'

  const relatedSection = (
    <>
      {relatedNews.length > 0 && (
        <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-palestine-black mb-6">أخبار مشابهة</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((item) => {
              const itemId = item.id || item._id?.toString()
              return (
              <Link
                key={itemId}
                to={`/news/${itemId}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {item.image && (
                  <ImageWithFallback
                    src={normalizeImageUrl(item.image)}
                    alt={item.title}
                    containerClassName="w-full aspect-video overflow-hidden"
                    imgClassName="w-full h-full object-cover"
                    fallbackText=""
                  />
                )}
                <div className="p-6">
                  <h3 className="font-bold text-palestine-black mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(item.date).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {(item.summary || item.content || '').slice(0, 120)}...
                  </p>
                </div>
              </Link>
              )
            })}
          </div>
        </section>
      )}
      <Comments contentType="news" contentId={newsId} />
    </>
  )

  return (
    <FullPostLayout
      type="news"
      backLink="/#news"
      backLabel="العودة إلى الأخبار"
      category={categoryLabel}
      title={newsItem.title}
      date={newsItem.date}
      author={newsItem.reporter || 'فريق الأخبار'}
      authorRole="فريق أخبار عائلة الشاعر"
      authorImage={`https://ui-avatars.com/api/?name=${encodeURIComponent(newsItem.reporter || 'Alshaer News')}&background=007A3D&color=fff`}
      readingTime={readingTime}
      coverImage={normalizeImageUrl(newsItem.image)}
      coverAlt={newsItem.title}
      tags={newsItem.tags}
      metaTitle={`${newsItem.title} | أخبار عائلة الشاعر`}
      metaDescription={newsItem.summary}
      metaImage={normalizeImageUrl(newsItem.image)}
      afterArticle={relatedSection}
      shareLabel="شارك هذا الخبر:"
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
          blockquote: ({ children }) => (
            <blockquote className="border-r-4 border-palestine-green bg-gray-50 p-4 my-6 italic">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pr-6 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pr-6 mb-4">{children}</ol>,
        }}
      >
        {newsItem.content}
      </ReactMarkdown>
    </FullPostLayout>
  )
}

export default NewsDetail
