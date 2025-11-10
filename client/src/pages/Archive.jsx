import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import ImageWithFallback from '../components/common/ImageWithFallback'
import { normalizeImageUrl } from '../utils/imageUtils'
import { fetchArchivedNews } from '../utils/api'
import { NEWS_CATEGORY_OPTIONS, formatNewsCategory, resolveNewsCategory } from '../constants/newsCategories'

const TYPE_TABS = [
  { value: 'news', label: 'الأخبار' },
  { value: 'articles', label: 'المقالات', disabled: true },
  { value: 'conversations', label: 'الحوارات', disabled: true }
]

const CATEGORY_FILTERS = [{ value: 'All', label: 'جميع التصنيفات' }, ...NEWS_CATEGORY_OPTIONS.map(option => ({
  value: option.value,
  label: option.label.replace(/^[^\s]+\s/, '') || option.label
}))]

const ArchiveCard = ({ item }) => {
  const categoryLabel = formatNewsCategory(item.category) || 'غير مصنف'
  const archivedAt = item.archivedAt ? new Date(item.archivedAt).toLocaleDateString('ar-SA', { dateStyle: 'medium' }) : null
  const linkTarget = `/news/${item.id || item._id}`

  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      {item.image && (
        <ImageWithFallback
          src={normalizeImageUrl(item.image)}
          alt={item.title}
          containerClassName="w-full aspect-video overflow-hidden"
          imgClassName="w-full h-full object-cover"
        />
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="bg-palestine-black text-white px-3 py-1 rounded-full">
            {categoryLabel}
          </span>
          {archivedAt && <span>مؤرشف في {archivedAt}</span>}
        </div>
        <header className="space-y-2">
          <h3 className="text-xl font-bold text-palestine-black leading-relaxed">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(item.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
          </p>
        </header>
        <p className="text-gray-700 leading-relaxed text-sm">
          {(item.summary || item.content || '').replace(/\s+/g, ' ').slice(0, 200)}...
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {item.reporter || item.author || 'عائلة الشاعر'}
          </div>
          <Link
            to={linkTarget}
            className="text-sm text-palestine-green font-medium hover:text-olive-700 transition-colors"
          >
            قراءة الخبر ←
          </Link>
        </div>
      </div>
    </article>
  )
}

const ArchivePage = () => {
  const [activeType, setActiveType] = useState('news')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [newsArchive, setNewsArchive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const loadArchive = async () => {
      if (activeType !== 'news') {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = {}
        if (category !== 'All') {
          params.category = category
        }
        const data = await fetchArchivedNews(params)
        setNewsArchive(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Unable to load archive:', err)
        setError(err.message || 'تعذر تحميل الأرشيف')
        setNewsArchive([])
      } finally {
        setLoading(false)
      }
    }

    loadArchive()
  }, [activeType, category])

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return newsArchive

    return newsArchive.filter((item) => {
      const text = `${item.title || ''} ${item.summary || ''} ${formatNewsCategory(item.category) || ''}`.toLowerCase()
      return text.includes(term)
    })
  }, [newsArchive, search])

  return (
    <div className="min-h-screen bg-gray-50 rtl-content">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-palestine-black">أرشيف العائلة</h1>
          <Link
            to="/"
            className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                disabled={tab.disabled}
                onClick={() => setActiveType(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeType === tab.value
                    ? 'bg-palestine-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeType === 'news' && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600" htmlFor="category-filter">
                  التصنيف
                </label>
                <select
                  id="category-filter"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input md:w-60"
                >
                  {CATEGORY_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في الأرشيف..."
                  className="form-input w-full"
                />
              </div>
            </div>
          )}
        </section>

        {activeType !== 'news' && (
          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center text-gray-600">
            <p>أرشيف هذا القسم سيتم تفعيله قريباً.</p>
          </section>
        )}

        {activeType === 'news' && (
          <section className="space-y-6">
            {loading && <LoadingSpinner />}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {!loading && !error && filteredNews.length === 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 text-center text-gray-500">
                لا توجد عناصر في الأرشيف لهذه الإعدادات.
              </div>
            )}
            {!loading && !error && filteredNews.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredNews.map((item) => (
                  <ArchiveCard key={item.id || item._id} item={item} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-12 border-t bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} عائلة الشاعر - جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  )
}

export default ArchivePage

