import React, { useMemo, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import FullPostLayout from './common/FullPostLayout'
import NotFound from './common/NotFound'
import ImageWithFallback from './common/ImageWithFallback'
import Comments from './common/Comments'
import { getNewsById, getRelatedNews } from '../data'
import { api } from '../utils/api'

const NewsDetail = () => {
  const { id } = useParams()
  const [newsItem, setNewsItem] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        // Try API first
        try {
          const response = await api.get(`/news/${id}`)
          const apiNews = response.data
          // Normalize the news to have both id and _id
          if (apiNews) {
            apiNews.id = apiNews.id || apiNews._id?.toString() || id
            setNewsItem(apiNews)
            setLoading(false)
            return
          }
        } catch (apiError) {
          console.log('API fetch failed, trying static data:', apiError)
        }
        
        // Fallback to static data
        const staticNews = getNewsById(id)
        if (staticNews) {
          setNewsItem(staticNews)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNews()
  }, [id])
  
  const relatedNews = useMemo(() => {
    if (!newsItem) return []
    return getRelatedNews(newsItem.id || id)
  }, [newsItem, id])

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

  const relatedSection = (
    <>
      {relatedNews.length > 0 && (
        <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-palestine-black mb-6">أخبار مشابهة</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedNews.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {item.image && (
                  <ImageWithFallback
                    src={item.image}
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
            ))}
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
      category="خبر"
      title={newsItem.title}
      date={newsItem.date}
      author={newsItem.reporter || 'فريق الأخبار'}
      authorRole="فريق أخبار عائلة الشاعر"
      authorImage={`https://ui-avatars.com/api/?name=${encodeURIComponent(newsItem.reporter || 'Alshaer News')}&background=007A3D&color=fff`}
      readingTime={readingTime}
      coverImage={newsItem.image}
      coverAlt={newsItem.title}
      tags={newsItem.tags}
      metaTitle={`${newsItem.title} | أخبار عائلة الشاعر`}
      metaDescription={newsItem.summary}
      metaImage={newsItem.image}
      afterArticle={relatedSection}
      shareLabel="شارك هذا الخبر:"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => (
            <ImageWithFallback
              src={src}
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
