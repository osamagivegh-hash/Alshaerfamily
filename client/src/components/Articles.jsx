import React, { useState } from 'react'

const Articles = ({ data }) => {
  const [selectedArticle, setSelectedArticle] = useState(null)

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
          {data.map((article) => (
            <article 
              key={article.id} 
              className="card fade-in hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedArticle(article)}
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
                
                <h3 className="text-xl font-bold text-palestine-black mb-2 leading-tight hover:text-palestine-green transition-colors duration-200">
                  {article.title}
                </h3>
                
                <p className="text-palestine-green font-medium text-sm">
                  بقلم: {article.author}
                </p>
              </div>
              
              {/* Article Preview */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {article.content.substring(0, 150)}...
              </p>
              
              {/* Article Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                  اقرأ المقال كاملاً ←
                </button>
                <div className="flex items-center text-gray-500 text-sm">
                  <span>5 دقائق قراءة</span>
                </div>
              </div>
            </article>
          ))}
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
              
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                {data[0].content}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">
                  اقرأ المقال كاملاً
                </button>
                <button className="btn-secondary">
                  شارك المقال
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-96 overflow-y-auto p-8 relative">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
              
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-palestine-black mb-4">
                  {selectedArticle.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>بقلم: {selectedArticle.author}</span>
                  <span>{new Date(selectedArticle.date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {selectedArticle.content}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="btn-primary"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
        
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
