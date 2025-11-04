import axios from 'axios'
import { getStaticSections } from '../data'

const API_BASE_URL = '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fetch all sections data
export const fetchSectionsData = async () => {
  try {
    const response = await api.get('/sections')
    return response.data
  } catch (error) {
    console.error('Error fetching sections data:', error)
    console.warn('Falling back to static sections data')
    return getStaticSections()
  }
}

// Fetch specific section data
export const fetchSectionData = async (section) => {
  try {
    const response = await api.get(`/sections/${section}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching ${section} data:`, error)
    console.warn(`Falling back to static ${section} data`)
    const staticSections = getStaticSections()
    return staticSections[section] ?? null
  }
}

// Submit contact form
export const submitContactForm = async (formData) => {
  try {
    const response = await api.post('/contact', formData)
    return response.data
  } catch (error) {
    console.error('Error submitting contact form:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('فشل في إرسال الرسالة')
  }
}

// Fetch contact messages (for admin)
export const fetchContactMessages = async () => {
  try {
    const response = await api.get('/contacts')
    return response.data
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    throw new Error('فشل في جلب الرسائل')
  }
}

// Fetch Palestine news from GNews.io API
export const fetchPalestineNews = async () => {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY || import.meta.env.VITE_GNEWS_API_KEY
    
    if (!apiKey) {
      console.warn('News API key not found. Using fallback news.')
      return []
    }

    // Try GNews.io first (free tier available)
    const gnewsUrl = `https://gnews.io/api/v4/search?q=Palestine&lang=ar&token=${apiKey}&max=10`
    
    try {
      const response = await fetch(gnewsUrl)
      if (!response.ok) {
        throw new Error('GNews API error')
      }
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        // Filter articles that mention Palestine
        const palestineArticles = data.articles
          .filter(article => 
            article.title?.toLowerCase().includes('palestine') ||
            article.title?.toLowerCase().includes('فلسطين') ||
            article.content?.toLowerCase().includes('palestine') ||
            article.content?.toLowerCase().includes('فلسطين')
          )
          .map(article => article.title)
          .filter(title => title && title.trim().length > 0)
          .slice(0, 10) // Limit to 10 headlines
      
        return palestineArticles.length > 0 ? palestineArticles : []
      }
    } catch (gnewsError) {
      console.warn('GNews.io failed, trying NewsAPI.org...', gnewsError)
      
      // Fallback to NewsAPI.org if GNews fails
      const newsApiUrl = `https://newsapi.org/v2/everything?q=Palestine&language=ar&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
      
      try {
        const newsApiResponse = await fetch(newsApiUrl)
        if (!newsApiResponse.ok) {
          throw new Error('NewsAPI error')
        }
        
        const newsApiData = await newsApiResponse.json()
        
        if (newsApiData.articles && newsApiData.articles.length > 0) {
          const headlines = newsApiData.articles
            .map(article => article.title)
            .filter(title => title && title.trim().length > 0)
            .slice(0, 10)
          
          return headlines.length > 0 ? headlines : []
        }
      } catch (newsApiError) {
        console.error('Both news APIs failed:', newsApiError)
        return []
      }
    }
    
    return []
  } catch (error) {
    console.error('Error fetching Palestine news:', error)
    return []
  }
}

export default api
