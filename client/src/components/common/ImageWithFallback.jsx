import React, { useState } from 'react'

/**
 * مكون عرض الصور مع بديل - محسّن
 * يدعم عرض الصور بالكامل دون اقتصاص مع تحميل سلس
 */
const ImageWithFallback = ({
  src,
  alt = 'صورة',
  containerClassName = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackIcon = '🖼️',
  fallbackText = 'لا توجد صورة متاحة',
  enableLightbox = false,
  objectFit = 'cover', // 'cover' | 'contain' | 'fill' | 'none'
  ...props
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [showLightbox, setShowLightbox] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // If no src provided or error occurred, show fallback
  if (!src || imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 rounded-xl ${containerClassName}`}
        {...props}
      >
        <div className="text-5xl mb-3 opacity-60">{fallbackIcon}</div>
        {fallbackText && (
          <p className="text-sm text-center px-4 font-medium">{fallbackText}</p>
        )}
      </div>
    )
  }

  // Generate object-fit class based on prop
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none'
  }[objectFit] || 'object-cover'

  // Replace object-cover in imgClassName if objectFit is specified
  const finalImgClassName = imgClassName
    .replace(/object-cover|object-contain|object-fill|object-none/g, '')
    .trim() + ` ${objectFitClass}`

  return (
    <>
      <div className={`relative overflow-hidden ${containerClassName}`.trim()}>
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-palestine-green border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-sm text-gray-400 font-medium">جاري التحميل...</span>
            </div>
          </div>
        )}

        {/* Actual Image */}
        <img
          src={src}
          alt={alt}
          className={`${finalImgClassName} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-all duration-500 ${enableLightbox ? 'cursor-zoom-in hover:scale-[1.02]' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={enableLightbox ? () => setShowLightbox(true) : undefined}
          {...props}
        />

        {/* Image Overlay on Hover (optional) */}
        {enableLightbox && !imageLoading && (
          <div
            className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100"
            onClick={() => setShowLightbox(true)}
          >
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-gray-700 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>تكبير</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full Size Image */}
          <img
            src={src}
            alt={alt}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image Caption */}
          {alt && alt !== 'صورة' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-center max-w-lg">
              {alt}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ImageWithFallback
