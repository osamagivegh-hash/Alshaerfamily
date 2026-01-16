import React, { useState, useRef, useEffect } from 'react'

const LazySection = ({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
  sectionName = 'القسم',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const currentRef = sectionRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(currentRef)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const defaultFallback = (
    <div className="w-full h-64 bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palestine-green mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )

  // Error fallback UI
  if (hasError) {
    return (
      <div className="w-full py-12 bg-red-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">حدث خطأ في تحميل {sectionName}</p>
          <button
            onClick={() => {
              setHasError(false)
              setIsVisible(true)
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className={className} {...props}>
      {isVisible ? (
        <ErrorCatcher onError={() => setHasError(true)}>
          {children}
        </ErrorCatcher>
      ) : (fallback || defaultFallback)}
    </div>
  )
}

// Simple error catcher component
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazySection Error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return null // Parent will handle display
    }
    return this.props.children
  }
}

export default LazySection

