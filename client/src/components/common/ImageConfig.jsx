import React from 'react'
import ImageWithFallback from './ImageWithFallback'

/**
 * ImageConfig - Enhanced image component with configuration options for different sections
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} section - Section type: 'article', 'news', 'conversation', 'gallery', 'palestine', 'hero'
 * @param {string} variant - Size variant: 'thumbnail', 'medium', 'large', 'cover', 'full'
 * @param {boolean} lazy - Enable lazy loading
 * @param {object} className - Additional CSS classes
 */

const ImageConfig = ({
  src,
  alt = 'صورة',
  section = 'article',
  variant = 'medium',
  lazy = true,
  className = '',
  ...props
}) => {
  // Section-specific configurations
  const sectionConfigs = {
    article: {
      defaultSize: 'aspect-video',
      containerClass: 'rounded-lg shadow-md',
      placeholder: '📄'
    },
    news: {
      defaultSize: 'aspect-video',
      containerClass: 'rounded-lg shadow-md',
      placeholder: '📰'
    },
    conversation: {
      defaultSize: 'aspect-video',
      containerClass: 'rounded-lg shadow-md',
      placeholder: '💬'
    },
    gallery: {
      defaultSize: 'aspect-square',
      containerClass: 'rounded-lg shadow-lg overflow-hidden',
      placeholder: '🖼️'
    },
    palestine: {
      defaultSize: 'aspect-video',
      containerClass: 'rounded-lg shadow-lg border-2 border-palestine-green',
      placeholder: '🇵🇸'
    },
    hero: {
      defaultSize: 'aspect-video',
      containerClass: 'rounded-xl shadow-2xl',
      placeholder: '✨'
    }
  }

  // Variant-specific sizes
  const variantSizes = {
    thumbnail: 'h-24 w-24',
    medium: 'w-full aspect-video',
    large: 'w-full aspect-video',
    cover: 'w-full h-full object-cover',
    full: 'w-full h-auto'
  }

  const config = sectionConfigs[section] || sectionConfigs.article
  const sizeClass = variantSizes[variant] || variantSizes.medium

  // Container classes
  const containerClassName = `
    ${sizeClass}
    ${config.containerClass}
    ${className}
    overflow-hidden
  `.trim().replace(/\s+/g, ' ')

  // Image classes
  const imageClassName = variant === 'cover' 
    ? 'w-full h-full object-cover'
    : variant === 'full'
    ? 'w-full h-auto'
    : 'w-full h-full object-cover'

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      containerClassName={containerClassName}
      imgClassName={imageClassName}
      fallbackText=""
      fallbackIcon={config.placeholder}
      {...props}
    />
  )
}

export default ImageConfig
