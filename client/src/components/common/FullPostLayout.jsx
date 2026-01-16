import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'
import Seo from './Seo'

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const computeReadingTime = (content, fallback = 6) => {
  if (!content) return fallback
  const words = content.split(/\s+/).length
  return Math.max(2, Math.ceil(words / 200))
}

/**
 * تخطيط عرض المقال الكامل - تصميم متميز وأنيق
 * يعرض الصور بالكامل دون اقتصاص مع تنسيق احترافي
 */
const FullPostLayout = ({
  type = 'article',
  backLink = '/',
  backLabel = 'العودة',
  category = 'مقال',
  title,
  date,
  author,
  authorRole,
  authorImage,
  readingTime,
  coverImage,
  coverAlt,
  tags = [],
  children,
  showShare = true,
  shareLabel = 'شارك هذا المحتوى:',
  afterArticle = null,
  metaTitle,
  metaDescription,
  metaImage,
}) => {
  const formattedDate = formatDate(date)
  const contentAsText = typeof children === 'string' ? children : ''
  const metaDescriptionValue = metaDescription || (contentAsText ? contentAsText.slice(0, 160) : '')
  const computedReadingTime = readingTime || computeReadingTime(contentAsText || metaDescriptionValue, 6)
  const metaTitleValue = metaTitle || `${title} | عائلة الشاعر`
  const seoType = ['news', 'dialogue', 'article'].includes(type) ? 'article' : type

  const handleShare = (platform) => {
    if (typeof window === 'undefined') return

    const url = window.location.href
    const text = `${title} | عائلة الشاعر`

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    }

    if (platform === 'copy') {
      navigator?.clipboard?.writeText(url)
      return
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 rtl-content">
      <Seo title={metaTitleValue} description={metaDescriptionValue} image={metaImage} type={seoType} />

      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-between">
            <Link
              to={backLink}
              className="flex items-center gap-2 text-palestine-green hover:text-olive-700 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">{backLabel}</span>
            </Link>
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-palestine-green transition-colors">
              عائلة الشاعر
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <article className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Article Header */}
          <div className="px-6 sm:px-10 lg:px-12 pt-10 pb-8 border-b border-gray-100">
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-gradient-to-r from-palestine-green to-olive-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                {category}
              </span>
              {formattedDate && (
                <span className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                </span>
              )}
            </div>

            {type === 'news' && (
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                التصنيف: <span className="font-semibold text-palestine-green">{category}</span>
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
              {title}
            </h1>

            {/* Author Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ImageWithFallback
                    src={authorImage}
                    alt={author}
                    containerClassName="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-palestine-green/20"
                    imgClassName="w-full h-full object-cover"
                    fallbackText=""
                    fallbackIcon="👤"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-palestine-green rounded-full flex items-center justify-center shadow">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{author}</p>
                  {authorRole && (
                    <p className="text-sm text-gray-500">{authorRole}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {computedReadingTime && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <svg className="w-4 h-4 text-palestine-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>مدة القراءة: <strong className="text-gray-700">{computedReadingTime} دقائق</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image - Full Display */}
          {coverImage && (
            <div className="relative bg-gradient-to-b from-gray-100 to-gray-50">
              <div className={`max-w-4xl mx-auto ${type === 'dialogue' ? 'max-w-2xl py-8' : 'py-6 px-4 sm:px-8'}`}>
                <ImageWithFallback
                  src={coverImage}
                  alt={coverAlt || title}
                  containerClassName="w-full overflow-hidden rounded-2xl shadow-2xl"
                  imgClassName="w-full h-auto object-contain"
                  fallbackText=""
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 bg-palestine-green/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-olive-700/5 rounded-full translate-x-1/4 translate-y-1/4" />
              </div>
            </div>
          )}

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="px-6 sm:px-10 lg:px-12 py-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  الوسوم:
                </span>
                {tags.map((tag) => (
                  <span key={tag} className="bg-white text-olive-700 px-3 py-1 rounded-full text-sm shadow-sm border border-olive-200 hover:bg-olive-50 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="px-6 sm:px-10 lg:px-12 py-10">
            <div className="prose prose-lg max-w-none 
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-p:text-gray-700 prose-p:leading-loose prose-p:text-lg
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-a:text-palestine-green hover:prose-a:text-olive-700
              prose-blockquote:border-r-4 prose-blockquote:border-palestine-green prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-lg prose-blockquote:not-italic
              prose-ul:mr-6 prose-ol:mr-6
              prose-li:text-gray-700 prose-li:mb-2
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto prose-img:max-w-full prose-img:h-auto
              prose-arabic tracking-normal"
            >
              {children}
            </div>
          </div>

          {/* Share Section */}
          {showShare && (
            <div className="px-6 sm:px-10 lg:px-12 py-8 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-gray-600 font-medium mb-4">{shareLabel}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                      فيسبوك
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.444l4.598-1.466A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.994 0-3.87-.577-5.453-1.572l-3.81 1.215 1.24-3.69A9.953 9.953 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z" />
                      </svg>
                      واتساب
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-sky-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      تويتر
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      تلغرام
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      نسخ الرابط
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 text-left">
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>نشر في {formattedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* After Article Content (Related articles, comments, etc.) */}
        {afterArticle && (
          <div className="mt-12">
            {afterArticle}
          </div>
        )}

        {/* Back to Top Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-palestine-green transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>العودة لأعلى</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default FullPostLayout
