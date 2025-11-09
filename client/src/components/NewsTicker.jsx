import React, { useEffect, useMemo, useRef, useState } from 'react'
import api from '../utils/api'
import './NewsTicker.css'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ITEMS = 50
const FALLBACK_MESSAGE = '🇵🇸 لا توجد عناوين متاحة حاليًا، سنُحدثها قريبًا'

const ARABIC_REGEX = /[\u0600-\u06FF]/

const buildRequestParams = () => ({
  params: {
    limit: MAX_ITEMS
  },
  timeout: 15000
})

const extractItems = (response) => {
  const payload = response?.data?.data || response?.data || {}
  const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : []
  return items
    .map(item => ({
      title: item.title?.trim() || '',
      link: item.link || '#',
      source: item.source || '',
      pubDate: item.pubDate || item.isoDate || null
    }))
    .filter(item => item.title)
}

const detectDirection = (items) => {
  if (!items.length) {
    return 'rtl'
  }

  const arabicCount = items.reduce((count, item) => {
    const text = `${item.title} ${item.source}`
    return ARABIC_REGEX.test(text) ? count + 1 : count
  }, 0)

  return arabicCount >= items.length / 2 ? 'rtl' : 'ltr'
}

const formatSource = (source) => {
  if (!source) return ''
  return `— ${source}`
}

const NewsTicker = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)

  const fetchNews = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true)
    }

    try {
      const response = await api.get('/news', buildRequestParams())
      const dataItems = extractItems(response)
      setItems(dataItems)

      const payload = response?.data?.data || {}
      if (payload.lastUpdated) {
        setLastUpdated(payload.lastUpdated)
      } else {
        setLastUpdated(new Date().toISOString())
      }

      setError(null)
    } catch (err) {
      console.error('Failed to fetch Palestine headlines', err)
      setError(err?.message || 'فشل في جلب عناوين الأخبار')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(true)

    intervalRef.current = window.setInterval(() => {
      fetchNews(false)
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const direction = useMemo(() => detectDirection(items), [items])
  const marqueeItems = useMemo(() => {
    if (!items.length) return []
    return [...items, ...items]
  }, [items])

  return (
    <section
      className="top-news-ticker"
      aria-label="Latest Palestine News"
      role="region"
      dir={direction}
    >
      <div className="top-news-ticker__container">
        <div className="top-news-ticker__label" aria-hidden="true">
          <span role="img" aria-label="News">📰</span>
          <span className="top-news-ticker__label-text">عناوين فلسطين الآن</span>
        </div>

        <div className="top-news-ticker__viewport">
          {loading && !items.length ? (
            <div className="top-news-ticker__status">جارِ تحميل آخر الأخبار الفلسطينية...</div>
          ) : error && !items.length ? (
            <div className="top-news-ticker__status top-news-ticker__status--error">{error}</div>
          ) : !items.length ? (
            <div className="top-news-ticker__status">{FALLBACK_MESSAGE}</div>
          ) : (
            <div className="top-news-ticker__track" data-paused-on-hover>
              <ul className="top-news-ticker__items" aria-live="polite">
                {marqueeItems.map((item, index) => (
                  <li key={`${item.link}-${index}`} className="top-news-ticker__item">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="top-news-ticker__link"
                    >
                      {item.title}
                    </a>
                    {item.source && (
                      <span className="top-news-ticker__source">
                        {formatSource(item.source)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="top-news-ticker__meta">
        <span className="top-news-ticker__meta-text">
          {lastUpdated
            ? `آخر تحديث: ${new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'يتم التحديث كل ٥ دقائق'}
        </span>
      </div>
    </section>
  )
}

export default NewsTicker

