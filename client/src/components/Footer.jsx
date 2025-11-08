import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-palestine-black text-white py-12">
      <div className="section-container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">عائلة الشاعر</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              موقع عائلة الشاعر - نحافظ على تراثنا ونروي قصصنا ونحتفل بجذورنا الفلسطينية العريقة.
            </p>
            <div className="flex space-x-reverse space-x-4">
              <button className="w-8 h-8 bg-palestine-green hover:bg-olive-700 rounded-lg flex items-center justify-center transition-colors duration-200">
                <span className="text-sm">📘</span>
              </button>
              <button className="w-8 h-8 bg-palestine-green hover:bg-olive-700 rounded-lg flex items-center justify-center transition-colors duration-200">
                <span className="text-sm">📷</span>
              </button>
              <button className="w-8 h-8 bg-palestine-green hover:bg-olive-700 rounded-lg flex items-center justify-center transition-colors duration-200">
                <span className="text-sm">🐦</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('hero').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('news').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  الأخبار
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('articles').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  مقالات
                </button>
              </li>
            </ul>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-xl font-bold mb-4">الأقسام</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('conversations').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  حوارات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('articles').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  مقالات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  معرض الصور
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-palestine-green transition-colors duration-200"
                >
                  تواصل معنا
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">التواصل</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <span className="ml-2">📧</span>
                info@alshaerfamily.com
              </p>
              <p className="flex items-center">
                <span className="ml-2">📱</span>
                +970 XX XXX XXXX
              </p>
              <p className="flex items-center">
                <span className="ml-2">📍</span>
                فلسطين - غزة
              </p>
            </div>
          </div>
        </div>

        {/* Palestinian Flag Colors Separator */}
        <div className="flex my-8">
          <div className="flex-1 h-1 bg-palestine-black"></div>
          <div className="flex-1 h-1 bg-palestine-white"></div>
          <div className="flex-1 h-1 bg-palestine-green"></div>
          <div className="flex-1 h-1 bg-palestine-red"></div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
          <div className="text-gray-300 mb-4 md:mb-0">
            <p>&copy; {currentYear} عائلة الشاعر. جميع الحقوق محفوظة.</p>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-6 text-gray-300">
            <button className="hover:text-palestine-green transition-colors duration-200">
              الخصوصية
            </button>
            <button className="hover:text-palestine-green transition-colors duration-200">
              الشروط والأحكام
            </button>
            <button className="hover:text-palestine-green transition-colors duration-200">
              خريطة الموقع
            </button>
          </div>
        </div>

        {/* Palestine Quote */}
        <div className="text-center mt-8 pt-8 border-t border-gray-700">
          <p className="text-palestine-green font-semibold italic">
            "فلسطين في القلب... دائماً وأبداً"
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
