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

  return (
    <section id="gallery" className="bg-palestine-white py-16">
      <div className="section-container">
        <h2 className="section-title">معرض الصور</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          صور من ذكريات العائلة، الاحتفالات، والتراث الفلسطيني العريق
        </p>
        
        {/* Gallery Collections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((gallery) => (
            <div 
              key={gallery.id || gallery._id}
              className="card hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedGallery(gallery)}
            >
              {gallery.images && gallery.images.length > 0 ? (
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={gallery.images[0]}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-48 bg-gradient-to-br from-olive-200 to-olive-300 rounded-lg hidden items-center justify-center">
                    <div className="text-center text-olive-700">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm">{gallery.images?.length || 0} صورة</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-olive-200 to-olive-300 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-olive-700">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-sm">{gallery.images?.length || 0} صورة</p>
                  </div>
                </div>
              )}
              
              <h4 className="text-xl font-bold text-palestine-black mb-2">
                {gallery.title}
              </h4>
              
              <p className="text-gray-600 text-sm mb-4">
                {gallery.description}
              </p>
              
              <button className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                عرض المجموعة ({gallery.images?.length || 0}) ←
              </button>
            </div>
          ))}
        </div>
        
        {/* Gallery Images Modal */}
        {selectedGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-6xl w-full max-h-screen overflow-y-auto">
              <button
                onClick={() => setSelectedGallery(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                ×
              </button>
              
              <div className="bg-white rounded-lg overflow-hidden p-6">
                <h2 className="text-2xl font-bold text-palestine-black mb-2">
                  {selectedGallery.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedGallery.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedGallery.images && selectedGallery.images.length > 0 ? (
                    selectedGallery.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage({ url: image, gallery: selectedGallery, index })}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${selectedGallery.title} - ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><div class="text-4xl text-gray-400">📷</div></div>'
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                            <div className="text-2xl mb-2">🔍</div>
                            <p className="text-sm font-medium">عرض</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      <div className="text-6xl mb-4">📷</div>
                      <p>لا توجد صور في هذه المجموعة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Single Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-5xl w-full max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                ×
              </button>
              
              <div className="bg-transparent rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.gallery?.title}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                  onError={(e) => {
                    e.target.src = ''
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="w-full h-96 bg-gray-800 flex items-center justify-center"><div class="text-white text-center"><div class="text-6xl mb-4">❌</div><p class="text-xl">فشل تحميل الصورة</p></div></div>'
                  }}
                />
                
                {selectedImage.gallery && (
                  <div className="mt-4 text-center text-white">
                    <p className="text-lg font-semibold">{selectedImage.gallery.title}</p>
                    <p className="text-sm text-gray-300">
                      صورة {selectedImage.index + 1} من {selectedImage.gallery.images?.length || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
