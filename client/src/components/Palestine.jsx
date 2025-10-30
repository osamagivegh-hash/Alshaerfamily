import React from 'react'

const Palestine = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section id="palestine" className="bg-palestine-white py-16">
        <div className="section-container">
          <h2 className="section-title">فلسطين</h2>
          <div className="text-center text-gray-500">
            لا توجد محتويات فلسطين متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="palestine" className="bg-palestine-white py-16">
      <div className="section-container">
        <h2 className="section-title">فلسطين</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">
          جذورنا في فلسطين الحبيبة، ذكرياتنا من الوطن، وحكايات أجدادنا من أرض الزيتون والياسمين
        </p>
        
        {/* Palestinian Flag Colors Banner */}
        <div className="flex justify-center mb-12">
          <div className="flex rounded-lg overflow-hidden shadow-lg">
            <div className="w-16 h-8 bg-palestine-black"></div>
            <div className="w-16 h-8 bg-palestine-white border-t border-b border-gray-300"></div>
            <div className="w-16 h-8 bg-palestine-green"></div>
            <div className="w-16 h-8 bg-palestine-red"></div>
          </div>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {data.map((item) => (
            <article key={item.id} className="card fade-in hover:shadow-xl transition-all duration-300">
              {/* Image placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-olive-200 to-olive-300 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center text-olive-700">
                  <div className="text-4xl mb-2">🏛️</div>
                  <p className="text-sm">{item.image || 'صورة من فلسطين'}</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-palestine-black mb-4 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                {item.content}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button className="btn-primary text-sm">
                  اقرأ المزيد
                </button>
                <button className="text-palestine-red hover:text-red-700 font-medium text-sm transition-colors duration-200">
                  شارك الذكرى ←
                </button>
              </div>
            </article>
          ))}
        </div>
        
        {/* Palestine Quote */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-olive-100 to-palestine-green/10 p-8 rounded-lg max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-bold text-palestine-black mb-4 leading-relaxed">
              "فلسطين ليست مجرد أرض، بل هي الهوية والذاكرة والحلم الذي نحمله في قلوبنا"
            </blockquote>
            <cite className="text-lg text-olive-700 font-medium">
              - من أقوال أجدادنا
            </cite>
          </div>
        </div>
        
        {/* Interactive Map Placeholder */}
        <div className="mt-16">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-palestine-black mb-6">خريطة جذور العائلة</h3>
            <div className="w-full h-64 bg-gradient-to-br from-olive-100 to-olive-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center text-olive-700">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg font-semibold">خريطة فلسطين التفاعلية</p>
                <p className="text-sm">أماكن عاشت فيها عائلة الشاعر</p>
              </div>
            </div>
            <button className="btn-secondary">
              استكشف الخريطة التفاعلية
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Palestine
