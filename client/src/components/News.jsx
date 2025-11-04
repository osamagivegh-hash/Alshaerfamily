import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './common/ImageWithFallback'
import { normalizeImageUrl } from '../utils/imageUtils'

const News = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section id="news" className="bg-gray-50 py-16">
        <div className="section-container">
          <h2 className="section-title">الأخبار</h2>
          <div className="text-center text-gray-500">
            لا توجد أخبار متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="news" className="bg-gray-50 py-16">
      <div className="section-container">
        <h2 className="section-title">الأخبار</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.map((newsItem) => {
            const newsId = newsItem.id || newsItem._id?.toString() || String(newsItem.id || newsItem._id)
            return (
            <article key={newsId} className="card fade-in hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {newsItem.image && (
                <ImageWithFallback
                  src={normalizeImageUrl(newsItem.image)}
                  alt={newsItem.title}
                  containerClassName="w-full aspect-video rounded-lg overflow-hidden mb-4 shadow"
                  imgClassName="w-full h-full object-cover"
                  fallbackText=""
                />
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-palestine-black mb-2 leading-tight">
                  {newsItem.headline || newsItem.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>{newsItem.reporter || 'فريق الأخبار'}</span>
                  <span>{new Date(newsItem.date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                {(newsItem.summary || newsItem.content || '')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .slice(0, 200)}
                {(newsItem.summary || newsItem.content || '').length > 200 ? '...' : ''}
              </p>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex flex-wrap gap-2 text-xs text-olive-700">
                  {newsItem.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-olive-100 text-olive-800 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/news/${newsId}`}
                  className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200"
                >
                  اقرأ التفاصيل ←
                </Link>
              </div>
            </article>
            )
          })}
        </div>
        
        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="btn-primary">
            عرض المزيد من الأخبار
          </button>
        </div>
      </div>
    </section>
  )
}

export default News
