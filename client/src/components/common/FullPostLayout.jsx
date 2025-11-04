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

  return (
    <div className="min-h-screen bg-gray-50 rtl-content">
      <Seo title={metaTitleValue} description={metaDescriptionValue} image={metaImage} type={seoType} />

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              to={backLink}
              className="flex items-center text-palestine-green hover:text-olive-700 transition-colors"
            >
              <span className="mr-2">←</span>
              {backLabel}
            </Link>
            <Link to="/" className="text-xl font-bold text-palestine-black">
              عائلة الشاعر
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-palestine-green text-white px-3 py-1 rounded-full text-sm font-medium">
                {category}
              </span>
              {formattedDate && (
                <span className="text-sm text-gray-500">{formattedDate}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-palestine-black leading-tight mb-6">
              {title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 gap-4">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={authorImage}
                  alt={author}
                  containerClassName="w-12 h-12 rounded-full overflow-hidden shadow"
                  imgClassName="w-full h-full object-cover"
                  fallbackText=""
                  fallbackIcon="👤"
                />
                <div>
                  <p className="font-semibold text-palestine-black">{author}</p>
                  {authorRole && (
                    <p className="text-sm text-gray-500">{authorRole}</p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                {computedReadingTime && (
                  <p>مدة القراءة: {computedReadingTime} دقائق</p>
                )}
              </div>
            </div>

            {coverImage && (
              <div className={`mt-6 ${type === 'dialogue' ? 'max-w-2xl mx-auto' : ''}`}>
                <ImageWithFallback
                  src={coverImage}
                  alt={coverAlt || title}
                  containerClassName={`w-full rounded-lg overflow-hidden shadow ${
                    type === 'dialogue' 
                      ? 'aspect-[21/9] max-h-96' 
                      : 'aspect-video'
                  }`}
                  imgClassName="w-full h-full object-cover"
                  fallbackText=""
                />
              </div>
            )}

            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 text-xs text-olive-700">
                {tags.map((tag) => (
                  <span key={tag} className="bg-olive-100 text-olive-800 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-palestine-black prose-p:text-gray-700 prose-p:leading-loose prose-strong:text-palestine-black prose-a:text-palestine-green hover:prose-a:text-olive-700 prose-arabic tracking-normal">
              {children}
            </div>
          </div>

          {showShare && (
            <div className="p-8 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">{shareLabel}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                      فيسبوك
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      واتساب
                    </button>
                    <button
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator?.clipboard?.writeText(window.location.href)
                        }
                      }}
                    >
                      نسخ الرابط
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500 text-left">
                  {formattedDate && <p>نشر في {formattedDate}</p>}
                </div>
              </div>
            </div>
          )}
        </article>

        {afterArticle}
      </main>
    </div>
  )
}

export default FullPostLayout
