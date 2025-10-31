import React, { useState } from 'react'

const ImageWithFallback = ({ 
  src, 
  alt = 'صورة', 
  className = '', 
  fallbackIcon = '🖼️',
  fallbackText = 'لا توجد صورة متاحة',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

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
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 ${className}`}
        {...props}
      >
        <div className="text-4xl mb-2">{fallbackIcon}</div>
        <p className="text-sm text-center px-2">{fallbackText}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palestine-green"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  )
}

export default ImageWithFallback
