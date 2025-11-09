import React, { useState, useEffect } from 'react'
import NewsTicker from './common/NewsTicker'
import { fetchPalestineNews, api } from '../utils/api'

const NewsTickers = () => {
  const [familyTickerNews, setFamilyTickerNews] = useState([])
  const [palestineNews, setPalestineNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [headerOffset, setHeaderOffset] = useState(120)

  useEffect(() => {
    // Fetch family ticker news from API
    const fetchFamilyNews = async () => {
      try {
        const response = await api.get('/ticker/family-news')
        // Extract data from nested response structure: { success, message, data, timestamp }
        const headlines = response.data?.data || response.data || []
        if (Array.isArray(headlines)) {
          setFamilyTickerNews(headlines)
        } else {
          setFamilyTickerNews([])
        }
      } catch (err) {
        console.error('Error fetching family ticker news:', err)
        setFamilyTickerNews([])
      }
    }

    // Fetch Palestine news on mount
    const fetchPalestine = async () => {
      try {
        const news = await fetchPalestineNews()
        if (news && Array.isArray(news) && news.length > 0) {
          setPalestineNews(news)
          setError(null)
        } else {
          // No real news available - show empty state
          setPalestineNews([])
          setError('لا توجد أخبار متاحة حالياً')
        }
      } catch (err) {
        console.error('Error fetching Palestine news:', err)
        setError(err.message || 'فشل في جلب أخبار فلسطين')
        setPalestineNews([])
      } finally {
        setLoading(false)
      }
    }

    const calculateOffset = () => {
      const headerEl = document.querySelector('header')
      const offset = headerEl?.offsetHeight ? headerEl.offsetHeight : 120
      setHeaderOffset(offset)
    }

    // Initial measurement
    calculateOffset()

    window.addEventListener('resize', calculateOffset)

    // Fetch both news sources
    fetchFamilyNews()
    fetchPalestine()

    // Auto-update Palestine news every 60 seconds
    const interval = setInterval(() => {
      fetchPalestineNews()
        .then(news => {
          if (news && Array.isArray(news) && news.length > 0) {
            setPalestineNews(news)
            setError(null)
          } else {
            setPalestineNews([])
            setError('لا توجد أخبار متاحة حالياً')
          }
        })
        .catch(err => {
          console.error('Error updating Palestine news:', err)
          setError(err.message || 'فشل في تحديث الأخبار')
          setPalestineNews([])
        })
    }, 60000) // 60 seconds

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', calculateOffset)
    }
  }, [])

  // Static messages for black ticker
  const staticBlackTickerMessages = [
    "🇵🇸 فلسطين حرة 🇵🇸",
    "من النهر إلى البحر، فلسطين ستكون حرة",
    "فلسطين في قلبنا وروحنا"
  ]

  // Calculate total height: header (64px) + tickers (3 * ~40px = 120px) = 184px
  const tickersHeight = palestineNews.length > 0 ? 120 : 80

  // Use API data if available, otherwise fallback to static data
  const displayFamilyNews = Array.isArray(familyTickerNews) ? familyTickerNews : []

  useEffect(() => {
    const headerEl = document.querySelector('header')
    if (headerEl?.offsetHeight) {
      setHeaderOffset(headerEl.offsetHeight)
    }
  }, [palestineNews.length, loading])

  return (
    <div
      id="news-tickers"
      className="fixed w-full z-40"
      style={{ top: `${headerOffset}px`, height: `${tickersHeight}px` }}
    >
      {/* Family News Ticker (Palestine Flag - Green) */}
      <NewsTicker
        items={displayFamilyNews}
        label="📰 أخبار العائلة"
        bgColor="bg-palestine-green"
        textColor="text-white"
        borderColor="border-palestine-green"
      />
      
      {/* Static Black Ticker (Palestine Flag - Black) - Thin - Separator */}
      <NewsTicker
        items={staticBlackTickerMessages}
        label="🇵🇸 فلسطين"
        bgColor="bg-palestine-black"
        textColor="text-white"
        borderColor="border-palestine-black"
        isThin={true}
      />
      
      {/* Palestine News Ticker (Palestine Flag - Red) */}
      {!loading && palestineNews.length > 0 && (
        <NewsTicker
          items={palestineNews}
          label="🇵🇸 أخبار فلسطين المباشرة"
          bgColor="bg-palestine-red"
          textColor="text-white"
          borderColor="border-palestine-red"
        />
      )}
      
      {loading && (
        <div className="bg-palestine-red text-white py-2.5 px-4 text-sm text-center animate-pulse">
          <span>🇵🇸 جاري تحميل أخبار فلسطين...</span>
        </div>
      )}
      
      {!loading && error && palestineNews.length === 0 && (
        <div className="bg-yellow-100 text-yellow-800 py-2.5 px-4 text-sm text-center border-b border-yellow-300">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  )
}

export default NewsTickers
