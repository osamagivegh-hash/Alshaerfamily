import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './common/ImageWithFallback'
import { normalizeImageUrl } from '../utils/imageUtils'
import { NEWS_CATEGORY_OPTIONS, NEWS_CATEGORY_LABELS, resolveNewsCategory } from '../constants/newsCategories'

const getNewsId = (item) =>
  item?.id ||
  (typeof item?._id === 'object' && item?._id?.toString ? item._id.toString() : item?._id) ||
  `${item?.title || 'news'}-${item?.date || Math.random()}`

const NewsCard = ({ item }) => {
  const newsId = getNewsId(item)
  const categorySlug = resolveNewsCategory(item.category)
  const categoryLabel = categorySlug ? NEWS_CATEGORY_LABELS[categorySlug] : null

  return (
    <article className="card fade-in hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {item.image && (
        <ImageWithFallback
          src={normalizeImageUrl(item.image)}
          alt={item.title}
          containerClassName="w-full aspect-video rounded-lg overflow-hidden mb-4 shadow"
          imgClassName="w-full h-full object-cover"
          fallbackText=""
        />
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-palestine-green font-semibold mb-2">
          <span>{categoryLabel || 'أخبار عامة'}</span>
          <span>{new Date(item.date).toLocaleDateString('ar-SA')}</span>
        </div>
        <h3 className="text-xl font-bold text-palestine-black mb-2 leading-tight">
          {item.headline || item.title}
        </h3>
        <div className="text-sm text-gray-600">
          {item.reporter || 'فريق الأخبار'}
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">
        {(item.summary || item.content || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 200)}
        {(item.summary || item.content || '').length > 200 ? '...' : ''}
      </p>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex flex-wrap gap-2 text-xs text-olive-700">
          {item.tags?.slice(0, 2).map((tag) => (
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
}

const News = ({ data }) => {
  const groupedNews = useMemo(() => {
    if (!Array.isArray(data)) return { groups: [], uncategorized: [] }

    const normalized = data.reduce(
      (acc, item) => {
        const slug = resolveNewsCategory(item.category)
        if (slug) {
          if (!acc.grouped[slug]) {
            acc.grouped[slug] = []
          }
          acc.grouped[slug].push(item)
        } else {
          acc.uncategorized.push(item)
        }
        return acc
      },
      { grouped: {}, uncategorized: [] }
    )

    const orderedGroups = NEWS_CATEGORY_OPTIONS
      .map(({ value, label }) => ({
        value,
        label,
        items: normalized.grouped[value] || []
      }))
      .filter(group => group.items.length > 0)

    return {
      groups: orderedGroups,
      uncategorized: normalized.uncategorized
    }
  }, [data])

  if ((!data || data.length === 0) && groupedNews.groups.length === 0 && groupedNews.uncategorized.length === 0) {
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
      <div className="section-container space-y-12">
        <h2 className="section-title">الأخبار</h2>

        {groupedNews.groups.map((group) => (
          <div key={group.value}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-palestine-black">
                {group.label}
              </h3>
              <span className="text-sm text-gray-500">
                {group.items.length} خبر
              </span>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <NewsCard key={getNewsId(item)} item={item} />
              ))}
            </div>
          </div>
        ))}

        {groupedNews.uncategorized.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-palestine-black">
                أخبار متنوعة
              </h3>
              <span className="text-sm text-gray-500">
                {groupedNews.uncategorized.length} خبر
              </span>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {groupedNews.uncategorized.map((item) => (
                <NewsCard key={getNewsId(item)} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default News
