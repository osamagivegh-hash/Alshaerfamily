import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api'

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sectionsData, setSectionsData] = useState({ articles: [], conversations: [], news: [] })
  const [isFetching, setIsFetching] = useState(false)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    const loadSections = async () => {
      setIsFetching(true)
      try {
        const response = await api.get('/sections')
        const data = response.data?.data || response.data || {}
        if (!isMounted) return
        setSectionsData({
          articles: Array.isArray(data.articles) ? data.articles : [],
          conversations: Array.isArray(data.conversations) ? data.conversations : [],
          news: Array.isArray(data.news) ? data.news : []
        })
      } catch (error) {
        console.error('Failed to fetch sections for search:', error)
        if (isMounted) {
          setSectionsData({ articles: [], conversations: [], news: [] })
        }
      } finally {
        if (isMounted) setIsFetching(false)
      }
    }

    loadSections()
    return () => {
      isMounted = false
    }
  }, [])

  // Search function
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const data = sectionsData
    setTimeout(() => {
      const searchResults = []

      // Search in articles
      data.articles?.forEach(article => {
        const score = calculateRelevanceScore(article, searchQuery, 'article')
        if (score > 0) {
          searchResults.push({
            ...article,
            type: 'article',
            route: `/articles/${article.id || article._id}`,
            score
          })
        }
      })

      // Search in conversations
      data.conversations?.forEach(conversation => {
        const score = calculateRelevanceScore(conversation, searchQuery, 'conversation')
        if (score > 0) {
          searchResults.push({
            ...conversation,
            type: 'conversation',
            route: `/conversations/${conversation.id || conversation._id}`,
            score
          })
        }
      })

      // Search in news
      data.news?.forEach(newsItem => {
        const score = calculateRelevanceScore(newsItem, searchQuery, 'news')
        if (score > 0) {
          searchResults.push({
            ...newsItem,
            type: 'news',
            route: `/news/${newsItem.id || newsItem._id}`,
            score
          })
        }
      })

      // Sort by relevance score and limit results
      const sortedResults = searchResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)

      setResults(sortedResults)
      setIsLoading(false)
    }, 200)
  }

  // Calculate relevance score
  const calculateRelevanceScore = (item, query, type) => {
    const searchTerms = query.toLowerCase().trim().split(/\s+/)
    let score = 0

    const title = (item.title || item.headline || '').toLowerCase()
    const content = (item.content || '').toLowerCase()
    const summary = (item.summary || '').toLowerCase()
    const author = (item.author || item.reporter || '').toLowerCase()
    const tags = (item.tags || []).join(' ').toLowerCase()

    searchTerms.forEach(term => {
      // Title matches (highest weight)
      if (title.includes(term)) {
        score += title === term ? 100 : 50
      }

      // Content matches
      if (content.includes(term)) {
        score += 20
      }

      // Summary matches
      if (summary.includes(term)) {
        score += 30
      }

      // Author matches
      if (author.includes(term)) {
        score += 15
      }

      // Tag matches
      if (tags.includes(term)) {
        score += 25
      }

      // Participants (for conversations)
      if (type === 'conversation' && item.participants) {
        const participants = item.participants.join(' ').toLowerCase()
        if (participants.includes(term)) {
          score += 20
        }
      }
    })

    return score
  }

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim()) {
      setIsOpen(true)
      performSearch(value)
    } else {
      setIsOpen(false)
      setResults([])
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'article': return 'مقال'
      case 'conversation': return 'حوار'
      case 'news': return 'خبر'
      default: return ''
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800'
      case 'conversation': return 'bg-green-100 text-green-800'
      case 'news': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="ابحث في المقالات والحوارات والأخبار..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent bg-white text-right"
          dir="rtl"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading || isFetching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-palestine-green mx-auto mb-2"></div>
              جاري البحث...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 text-sm text-gray-600">
                تم العثور على {results.length} نتيجة
              </div>
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id || result._id}-${index}`}
                  to={result.route}
                  className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    setQuery('')
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-palestine-black line-clamp-2 flex-1">
                      {result.title || result.headline}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getTypeColor(result.type)}`}>
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {(result.summary || result.content || '').slice(0, 120)}...
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{result.author || result.reporter || 'غير محدد'}</span>
                    <span>{new Date(result.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                </Link>
              ))}
            </>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-2">🔍</div>
              لم يتم العثور على نتائج لـ "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar
