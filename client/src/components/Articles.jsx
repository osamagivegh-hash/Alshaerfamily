import React from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from './common/ArticleCard'

/**
 * قسم المقالات - تصميم محسّن وأنيق
 * يعرض المقالات بتنسيق متناسق مع صور كاملة
 */
const Articles = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section id="articles" className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-palestine-green/10 text-palestine-green px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✍️ المقالات
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مقالات وكتابات العائلة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              مقالات وكتابات أفراد العائلة حول التراث، التاريخ، والقيم العائلية
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مقالات متاحة حالياً</h3>
            <p className="text-gray-500">سيتم نشر المقالات قريباً</p>
          </div>
        </div>
      </section>
    )
  }

  // Get featured article (first one)
  const featuredArticle = data[0]
  const featuredId = featuredArticle.id || featuredArticle._id?.toString()

  // Get remaining articles
  const remainingArticles = data.slice(1)

  return (
    <section id="articles" className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-palestine-green to-olive-700 text-white px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            ✍️ المقالات
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            مقالات وكتابات العائلة
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            مقالات وكتابات أفراد العائلة حول التراث، التاريخ، والقيم العائلية
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-palestine-green to-olive-700 mx-auto mt-6 rounded-full" />
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <ArticleCard
            id={featuredId}
            title={featuredArticle.title}
            summary={featuredArticle.summary}
            content={featuredArticle.content}
            image={featuredArticle.image}
            author={featuredArticle.author}
            date={featuredArticle.date}
            category="مقال مميز"
            categoryColor="palestine-red"
            readingTime={featuredArticle.readingTime}
            tags={featuredArticle.tags}
            linkPrefix="/articles"
            variant="featured"
          />
        </div>

        {/* Articles Grid */}
        {remainingArticles.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {remainingArticles.map((article) => {
              const articleId = article.id || article._id?.toString()
              return (
                <ArticleCard
                  key={articleId}
                  id={articleId}
                  title={article.title}
                  summary={article.summary}
                  content={article.content}
                  image={article.image}
                  author={article.author}
                  date={article.date}
                  category="مقال"
                  categoryColor="palestine-green"
                  readingTime={article.readingTime}
                  tags={article.tags}
                  linkPrefix="/articles"
                  variant="default"
                />
              )
            })}
          </div>
        )}

        {/* View All & Write Article Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {data.length > 3 && (
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 bg-white text-palestine-green border-2 border-palestine-green px-8 py-3 rounded-xl font-semibold hover:bg-palestine-green hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>عرض جميع المقالات</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-palestine-green to-olive-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-olive-700 hover:to-palestine-green transition-all duration-300 shadow-lg hover:shadow-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>اكتب مقالاً جديداً</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Articles
