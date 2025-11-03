import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './common/ImageWithFallback'

const Articles = ({ data }) => {

  if (!data || data.length === 0) {
    return (
      <section id="articles" className="bg-gray-50 py-16">
        <div className="section-container">
          <h2 className="section-title">مقالات</h2>
          <div className="text-center text-gray-500">
            لا توجد مقالات متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="articles" className="bg-gray-50 py-16">
      <div className="section-container">
        <h2 className="section-title">مقالات</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          مقالات وكتابات أفراد العائلة حول التراث، التاريخ، والقيم العائلية
        </p>
        
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((article) => {
            const articleId = article.id || article._id?.toString() || String(article.id || article._id)
            return (
            <Link
              key={articleId}
              to={`/articles/${articleId}`}
              className="card fade-in hover:shadow-xl transition-all duration-300 block"
            >
              {/* Article Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-palestine-green text-white px-3 py-1 rounded-full text-sm font-medium">
                    مقال
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(article.date).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                {article.image && (
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    containerClassName="w-full aspect-video rounded-lg overflow-hidden mb-4 shadow"
                    imgClassName="w-full h-full object-cover"
                    fallbackText=""
                  />
                )}

                <h3 className="text-xl font-bold text-palestine-black mb-2 leading-tight hover:text-palestine-green transition-colors duration-200">
                  {article.title}
                </h3>

                <p className="text-palestine-green font-medium text-sm">
                  بقلم: {article.author}
                </p>
              </div>
              
              {/* Article Preview */}
              <div className="text-gray-700 leading-relaxed mb-6">
                {(article.summary || article.content) && (
                  <p className="whitespace-pre-line">
                    {(article.summary || article.content)
                      .replace(/\s+/g, ' ')
                      .trim()
                      .slice(0, 160)}
                    {(article.summary || article.content).length > 160 ? '...' : ''}
                  </p>
                )}
              </div>
              
              {/* Article Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                  اقرأ المقال كاملاً ←
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <span>{article.readingTime || Math.ceil((article.content?.length || 500) / 900)} دقائق قراءة</span>
                </div>
              </div>
            </Link>
            )
          })}
        </div>
        
        {/* Featured Article */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-palestine-black mb-8 text-center">المقال المميز</h3>
          {data.length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-lg border-r-4 border-palestine-red max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h4 className="text-3xl font-bold text-palestine-black mb-2">
                    {data[0].title}
                  </h4>
                  <p className="text-palestine-green font-semibold">
                    بقلم: {data[0].author}
                  </p>
                </div>
                <span className="text-gray-500 text-sm mt-2 lg:mt-0">
                  {new Date(data[0].date).toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="text-gray-700 leading-relaxed text-lg mb-6">
                <p className="whitespace-pre-line">
                  {data[0].content && data[0].content.length > 300 
                    ? `${data[0].content.substring(0, 300).replace(/\s+/g, ' ').trim()}...`
                    : data[0].content?.replace(/\s+/g, ' ').trim()
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={`/articles/${data[0].id || data[0]._id?.toString() || data[0].id}`} className="btn-primary">
                  اقرأ المقال كاملاً
                </Link>
                <button className="btn-secondary">
                  شارك المقال
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Submit Article Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            اكتب مقالاً جديداً
          </button>
        </div>
      </div>
    </section>
  )
}

export default Articles
