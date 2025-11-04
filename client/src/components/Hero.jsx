import React from 'react'
import OliveTree from './OliveTree'

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-palestine-white to-olive-50">
      <div className="section-container text-center">
        <div className="fade-in">
          {/* Olive Tree Illustration */}
          <div className="mb-8">
            <OliveTree />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-palestine-black mb-6 leading-tight">
            عائلة الشاعر
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-olive-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            تاريخنا، تراثنا، وجذورنا الفلسطينية العريقة
          </p>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              مرحباً بكم في موقع عائلة الشاعر، حيث نحتفظ بذكرياتنا ونروي قصصنا ونحافظ على تراثنا الفلسطيني الأصيل. 
              هنا تجدون أخبار العائلة، حواراتنا، شجرة عائلتنا، وكل ما يربطنا بجذورنا في فلسطين الحبيبة.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => document.getElementById('news').scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
            >
              استكشف أخبار العائلة
            </button>
            <button 
              onClick={() => document.getElementById('family-tree').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
            >
              شاهد شجرة العائلة
            </button>
          </div>

          {/* Palestinian Flag Colors Decoration */}
          <div className="flex justify-center mt-16 space-x-reverse space-x-4">
            <div className="w-4 h-4 bg-palestine-black rounded-full"></div>
            <div className="w-4 h-4 bg-palestine-white border-2 border-gray-300 rounded-full"></div>
            <div className="w-4 h-4 bg-palestine-green rounded-full"></div>
            <div className="w-4 h-4 bg-palestine-red rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
