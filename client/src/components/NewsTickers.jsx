import React, { useState, useEffect } from 'react'
import NewsTicker from './common/NewsTicker'
import PalestineNewsTicker from './NewsTicker'
import { api } from '../utils/api'

const NewsTickers = () => {
  const [familyTickerNews, setFamilyTickerNews] = useState([])
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

    const calculateOffset = () => {
      const headerEl = document.querySelector('header')
      const offset = headerEl?.offsetHeight ? headerEl.offsetHeight : 120
      setHeaderOffset(offset)
    }

    // Initial measurement
    calculateOffset()

    window.addEventListener('resize', calculateOffset)

    // Fetch news sources
    fetchFamilyNews()
    const interval = setInterval(fetchFamilyNews, 60000)

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

  // Use API data if available, otherwise fallback to static data
  const displayFamilyNews = Array.isArray(familyTickerNews) ? familyTickerNews : []

  return (
    <div
      id="news-tickers"
      className="fixed w-full z-40 space-y-0"
      style={{ top: `${headerOffset}px` }}
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
      
      {/* Palestine Headlines Ticker */}
      <PalestineNewsTicker />
    </div>
  )
}

export default NewsTickers
