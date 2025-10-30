import React, { useState } from 'react'

const Gallery = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedGallery, setSelectedGallery] = useState(null)

  if (!data || data.length === 0) {
    return (
      <section id="gallery" className="bg-palestine-white py-16">
        <div className="section-container">
          <h2 className="section-title">معرض الصور</h2>
          <div className="text-center text-gray-500">
            لا توجد صور متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  // Mock images for demonstration
  const mockImages = [
    { id: 1, title: 'احتفال العائلة', category: 'عائلية', src: 'family-celebration.jpg' },
    { id: 2, title: 'البيت القديم', category: 'تراثية', src: 'old-house.jpg' },
    { id: 3, title: 'أشجار الزيتون', category: 'فلسطين', src: 'olive-trees.jpg' },
    { id: 4, title: 'زفاف محمد', category: 'عائلية', src: 'wedding.jpg' },
    { id: 5, title: 'القدس القديمة', category: 'فلسطين', src: 'jerusalem.jpg' },
    { id: 6, title: 'الجد عبد الله', category: 'تراثية', src: 'grandfather.jpg' },
  ]

  const categories = ['الكل', 'عائلية', 'تراثية', 'فلسطين']
  const [activeCategory, setActiveCategory] = useState('الكل')

  const filteredImages = activeCategory === 'الكل' 
    ? mockImages 
    : mockImages.filter(img => img.category === activeCategory)

  return (
    <section id="gallery" className="bg-palestine-white py-16">
      <div className="section-container">
        <h2 className="section-title">معرض الصور</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          صور من ذكريات العائلة، الاحتفالات، والتراث الفلسطيني العريق
        </p>
        
        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-palestine-green text-white shadow-md'
                    : 'text-gray-600 hover:text-palestine-green hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image) => (
            <div 
              key={image.id}
              className="group cursor-pointer fade-in"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-olive-200 to-olive-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-center text-olive-700">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm font-medium">{image.src}</p>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="text-sm font-medium">عرض الصورة</p>
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-2 right-2 bg-palestine-green text-white px-2 py-1 rounded-md text-xs font-medium">
                  {image.category}
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <h3 className="font-semibold text-palestine-black">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gallery Collections */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-palestine-black mb-8 text-center">مجموعات الصور</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((gallery) => (
              <div 
                key={gallery.id}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedGallery(gallery)}
              >
                <div className="w-full h-48 bg-gradient-to-br from-olive-200 to-olive-300 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-olive-700">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-sm">{gallery.images?.length || 0} صورة</p>
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-palestine-black mb-2">
                  {gallery.title}
                </h4>
                
                <p className="text-gray-600 text-sm mb-4">
                  {gallery.description}
                </p>
                
                <button className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                  عرض المجموعة ←
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                ×
              </button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-olive-200 to-olive-300 flex items-center justify-center">
                  <div className="text-center text-olive-700">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-semibold">{selectedImage.title}</p>
                    <p className="text-sm">{selectedImage.src}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-palestine-black mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-palestine-green font-medium mb-4">
                    التصنيف: {selectedImage.category}
                  </p>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="btn-primary"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Upload Photos Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            رفع صور جديدة
          </button>
        </div>
      </div>
    </section>
  )
}

export default Gallery
