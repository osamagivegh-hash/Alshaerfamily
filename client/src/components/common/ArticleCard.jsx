import React, { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'
import { normalizeImageUrl } from '../../utils/imageUtils'

/**
 * بطاقة مقال/خبر متميزة وأنيقة
 * تعرض الصورة بالكامل دون اقتصاص مع تصميم عصري
 */
const ArticleCard = ({
    id,
    title,
    summary,
    content,
    image,
    author,
    date,
    category = 'مقال',
    categoryColor = 'palestine-green',
    readingTime,
    tags = [],
    linkPrefix = '/articles',
    variant = 'default', // 'default' | 'featured' | 'compact' | 'horizontal'
}) => {
    const navigate = useNavigate()

    const displaySummary = (summary || content || '')
        .replace(/\\s+/g, ' ')
        .trim()
        .slice(0, variant === 'compact' ? 120 : 200)

    const calculatedReadingTime = readingTime || Math.ceil((content?.length || 500) / 900)
    const formattedDate = date ? new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : ''

    // Prevent event bubbling and ensure clean navigation
    // This stops parent touch handlers from interfering with link clicks
    const handleClick = useCallback((e) => {
        e.stopPropagation()
        // Let the Link component handle navigation naturally
    }, [])

    // Featured variant - large card
    if (variant === 'featured') {
        return (
            <Link
                to={`${linkPrefix}/${id}`}
                onClick={handleClick}
                className="group block relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
            >
                {/* Image Container - Full width with gradient overlay */}
                <div className="relative">
                    {image ? (
                        <div className="relative overflow-hidden">
                            <ImageWithFallback
                                src={normalizeImageUrl(image)}
                                alt={title}
                                containerClassName="w-full"
                                imgClassName="w-full h-auto max-h-[400px] object-contain bg-gradient-to-b from-gray-100 to-gray-50 group-hover:scale-105 transition-transform duration-700"
                                fallbackText=""
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                    ) : (
                        <div className="h-64 bg-gradient-to-br from-palestine-green/20 to-olive-700/20 flex items-center justify-center">
                            <span className="text-6xl opacity-50">📄</span>
                        </div>
                    )}

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        {/* Category badge */}
                        <span className={`inline-block bg-${categoryColor} text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-3 shadow-lg`}>
                            {category}
                        </span>

                        <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-palestine-green transition-colors duration-300">
                            {title}
                        </h2>

                        <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4">
                            {displaySummary}...
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{author}</span>
                                <span className="opacity-70">•</span>
                                <span className="opacity-70">{formattedDate}</span>
                            </div>
                            <span className="opacity-70">{calculatedReadingTime} دقائق قراءة</span>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    // Horizontal variant
    if (variant === 'horizontal') {
        return (
            <Link
                to={`${linkPrefix}/${id}`}
                onClick={handleClick}
                className="group flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
                {/* Image - side */}
                {image && (
                    <div className="md:w-2/5 flex-shrink-0">
                        <ImageWithFallback
                            src={normalizeImageUrl(image)}
                            alt={title}
                            containerClassName="w-full h-full min-h-[200px] md:min-h-[250px]"
                            imgClassName="w-full h-full object-contain bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-500"
                            fallbackText=""
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`bg-${categoryColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                {category}
                            </span>
                            <span className="text-gray-400 text-sm">{formattedDate}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-palestine-green transition-colors duration-200 line-clamp-2">
                            {title}
                        </h3>

                        <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                            {displaySummary}...
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palestine-green to-olive-700 flex items-center justify-center text-white font-bold text-sm">
                                {author?.charAt(0) || 'ك'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{author}</p>
                                <p className="text-xs text-gray-500">{calculatedReadingTime} دقائق قراءة</p>
                            </div>
                        </div>

                        <span className="text-palestine-green font-medium text-sm group-hover:translate-x-[-4px] transition-transform duration-200 flex items-center gap-1">
                            اقرأ المزيد
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        )
    }

    // Compact variant
    if (variant === 'compact') {
        return (
            <Link
                to={`${linkPrefix}/${id}`}
                onClick={handleClick}
                className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
                {image && (
                    <ImageWithFallback
                        src={normalizeImageUrl(image)}
                        alt={title}
                        containerClassName="w-full"
                        imgClassName="w-full h-auto max-h-[180px] object-contain bg-gray-50"
                        fallbackText=""
                    />
                )}

                <div className="p-4">
                    <span className={`inline-block bg-${categoryColor}/10 text-${categoryColor} px-2 py-0.5 rounded text-xs font-medium mb-2`}>
                        {category}
                    </span>

                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-palestine-green transition-colors duration-200">
                        {title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formattedDate}</span>
                        <span>{calculatedReadingTime} د</span>
                    </div>
                </div>
            </Link>
        )
    }

    // Default variant - elegant card
    return (
        <Link
            to={`${linkPrefix}/${id}`}
            onClick={handleClick}
            className="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-palestine-green/30"
        >
            {/* Image Container - Natural aspect ratio */}
            {image && (
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <ImageWithFallback
                        src={normalizeImageUrl(image)}
                        alt={title}
                        containerClassName="w-full"
                        imgClassName="w-full h-auto max-h-[280px] object-contain group-hover:scale-105 transition-transform duration-700"
                        fallbackText=""
                    />

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50" />

                    {/* Category badge */}
                    <span className={`absolute top-4 right-4 bg-${categoryColor} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg`}>
                        {category}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {/* Meta info */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="font-medium text-palestine-green">{author}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-palestine-green transition-colors duration-300 line-clamp-2">
                    {title}
                </h3>

                {/* Summary */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {displaySummary}...
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-olive-100 text-olive-700 px-2 py-0.5 rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{calculatedReadingTime} دقائق قراءة</span>
                    </div>

                    <span className="text-palestine-green font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        اقرأ المزيد
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default ArticleCard
