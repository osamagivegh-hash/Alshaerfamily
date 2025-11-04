import React, { useState, useEffect } from 'react'
import NewsTicker from './common/NewsTicker'
import familyNews from '../data/familyNews'
import { fetchPalestineNews, api } from '../utils/api'

const NewsTickers = () => {
  const [familyTickerNews, setFamilyTickerNews] = useState([])
  const [palestineNews, setPalestineNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch family ticker news from API
    const fetchFamilyNews = async () => {
      try {
        const response = await api.get('/ticker/family-news')
        if (response.data && response.data.length > 0) {
          setFamilyTickerNews(response.data)
        } else {
          // Fallback to static data
          setFamilyTickerNews(familyNews)
        }
      } catch (err) {
        console.error('Error fetching family ticker news:', err)
        // Fallback to static data
        setFamilyTickerNews(familyNews)
      }
    }

    // Fetch Palestine news on mount
    const fetchPalestine = async () => {
      try {
        const news = await fetchPalestineNews()
        if (news && news.length > 0) {
          setPalestineNews(news)
        } else {
          // Fallback headlines if API fails
          setPalestineNews([
            "تحديثات مباشرة من فلسطين 🇵🇸",
            "أخبار فلسطين اليوم",
            "فلسطين في قلبنا دائماً 🇵🇸"
          ])
        }
      } catch (err) {
        console.error('Error fetching Palestine news:', err)
        setError(err.message)
        // Fallback headlines
        setPalestineNews([
          "تحديثات مباشرة من فلسطين 🇵🇸",
          "أخبار فلسطين اليوم",
          "فلسطين في قلبنا دائماً 🇵🇸"
        ])
      } finally {
        setLoading(false)
      }
    }

    // Fetch both news sources
    fetchFamilyNews()
    fetchPalestine()

    // Auto-update Palestine news every 60 seconds
    const interval = setInterval(() => {
      fetchPalestineNews()
        .then(news => {
          if (news && news.length > 0) {
            setPalestineNews(news)
          }
        })
        .catch(err => {
          console.error('Error updating Palestine news:', err)
        })
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Calculate total height: header (64px) + tickers (2 * ~40px = 80px) = 144px
  const tickersHeight = palestineNews.length > 0 ? 80 : 40

  // Use API data if available, otherwise fallback to static data
  const displayFamilyNews = familyTickerNews.length > 0 ? familyTickerNews : familyNews

  return (
    <div className="fixed top-16 w-full z-40" style={{ height: `${tickersHeight}px` }}>
      {/* Family News Ticker */}
      <NewsTicker
        items={displayFamilyNews}
        label="📰 أخبار العائلة"
        bgColor="bg-palestine-green"
        textColor="text-white"
        borderColor="border-palestine-green"
      />
      
      {/* Palestine News Ticker */}
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
    </div>
  )
}

export default NewsTickers
