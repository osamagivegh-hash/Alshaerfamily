import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from './common/ArticleCard'
import { NEWS_CATEGORY_OPTIONS, NEWS_CATEGORY_LABELS, resolveNewsCategory } from '../constants/newsCategories'

const getNewsId = (item) =>
  item?.id ||
  (typeof item?._id === 'object' && item?._id?.toString ? item._id.toString() : item?._id) ||
  `${item?.title || 'news'}-${item?.date || Math.random()}`

/**
 * قسم الأخبار - تصميم محسّن وأنيق
 * يعرض الأخبار بتنسيق متناسق مع تصنيفات واضحة
 */
const News = ({ data }) => {
  const groupedNews = useMemo(() => {
    if (!Array.isArray(data)) return { groups: [], uncategorized: [], featured: null }

    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
    const featured = sortedData[0] || null
    const remaining = sortedData.slice(1)

    const normalized = remaining.reduce(
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
      uncategorized: normalized.uncategorized,
      featured
    }
  }, [data])

  if ((!data || data.length === 0) && groupedNews.groups.length === 0 && groupedNews.uncategorized.length === 0) {
    return (
      <section id="news" className="bg-gradient-to-br from-gray-100 via-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-palestine-red/10 text-palestine-red px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📰 الأخبار
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              آخر الأخبار والمستجدات
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              تابع أحدث أخبار العائلة والفعاليات والمناسبات
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أخبار متاحة حالياً</h3>
            <p className="text-gray-500">سيتم نشر الأخبار قريباً</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="news" className="bg-gradient-to-br from-gray-100 via-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-palestine-red to-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            📰 الأخبار
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            آخر الأخبار والمستجدات
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            تابع أحدث أخبار العائلة والفعاليات والمناسبات المهمة
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-palestine-red to-red-600 mx-auto mt-6 rounded-full" />
        </div>

        {/* Featured News */}
        {groupedNews.featured && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-palestine-red text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow">
                🔥 خبر بارز
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent" />
            </div>
            <ArticleCard
              id={getNewsId(groupedNews.featured)}
              title={groupedNews.featured.headline || groupedNews.featured.title}
              summary={groupedNews.featured.summary}
              content={groupedNews.featured.content}
              image={groupedNews.featured.image}
              author={groupedNews.featured.reporter || 'فريق الأخبار'}
              date={groupedNews.featured.date}
              category={NEWS_CATEGORY_LABELS[resolveNewsCategory(groupedNews.featured.category)] || 'خبر'}
              categoryColor="palestine-red"
              tags={groupedNews.featured.tags}
              linkPrefix="/news"
              variant="horizontal"
            />
          </div>
        )}

        {/* Categorized News Groups */}
        {groupedNews.groups.map((group, index) => (
          <div key={group.value} className="mb-14">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-palestine-green to-olive-700 flex items-center justify-center text-white shadow-lg">
                  {getCategoryIcon(group.value)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {group.label}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {group.items.length} {group.items.length === 1 ? 'خبر' : 'أخبار'}
                  </span>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
            </div>

            {/* News Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.items.slice(0, 6).map((item) => (
                <ArticleCard
                  key={getNewsId(item)}
                  id={getNewsId(item)}
                  title={item.headline || item.title}
                  summary={item.summary}
                  content={item.content}
                  image={item.image}
                  author={item.reporter || 'فريق الأخبار'}
                  date={item.date}
                  category={group.label}
                  categoryColor="palestine-green"
                  tags={item.tags}
                  linkPrefix="/news"
                  variant="default"
                />
              ))}
            </div>

            {/* View More Link */}
            {group.items.length > 6 && (
              <div className="text-center mt-6">
                <Link
                  to={`/news?category=${group.value}`}
                  className="inline-flex items-center gap-2 text-palestine-green hover:text-olive-700 font-medium transition-colors duration-200"
                >
                  <span>عرض المزيد من {group.label}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Uncategorized News */}
        {groupedNews.uncategorized.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white shadow-lg">
                  📋
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    أخبار متنوعة
                  </h3>
                  <span className="text-sm text-gray-500">
                    {groupedNews.uncategorized.length} {groupedNews.uncategorized.length === 1 ? 'خبر' : 'أخبار'}
                  </span>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedNews.uncategorized.map((item) => (
                <ArticleCard
                  key={getNewsId(item)}
                  id={getNewsId(item)}
                  title={item.headline || item.title}
                  summary={item.summary}
                  content={item.content}
                  image={item.image}
                  author={item.reporter || 'فريق الأخبار'}
                  date={item.date}
                  category="خبر"
                  categoryColor="gray-600"
                  tags={item.tags}
                  linkPrefix="/news"
                  variant="default"
                />
              ))}
            </div>
          </div>
        )}

        {/* View All News Button */}
        <div className="text-center mt-12">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-palestine-red to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-palestine-red transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>تصفح جميع الأخبار</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Helper function to get category icon
const getCategoryIcon = (categorySlug) => {
  const icons = {
    'family': '👨‍👩‍👧‍👦',
    'events': '🎉',
    'achievements': '🏆',
    'announcements': '📢',
    'memorial': '🕯️',
    'general': '📰'
  }
  return icons[categorySlug] || '📰'
}

export default News
