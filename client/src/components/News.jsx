import React from 'react'

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
          {data.map((newsItem) => (
            <article key={newsItem.id} className="card fade-in hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-palestine-black mb-2 leading-tight">
                  {newsItem.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>{newsItem.author}</span>
                  <span>{new Date(newsItem.date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {newsItem.content}
              </p>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                  اقرأ المزيد ←
                </button>
              </div>
            </article>
          ))}
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
