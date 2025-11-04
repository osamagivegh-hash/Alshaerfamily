import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fetch all sections data from MongoDB only
export const fetchSectionsData = async () => {
  try {
    const response = await api.get('/sections')
    return response.data
  } catch (error) {
    console.error('Error fetching sections data:', error)
    throw new Error('فشل في جلب البيانات من الخادم')
  }
}

// Fetch specific section data from MongoDB only
export const fetchSectionData = async (section) => {
  try {
    const response = await api.get(`/sections/${section}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching ${section} data:`, error)
    throw new Error(`فشل في جلب بيانات ${section} من الخادم`)
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

// Fetch Palestine news from server-side API (avoids CORS issues)
export const fetchPalestineNews = async () => {
  try {
    // Use server-side endpoint to avoid CORS issues
    const response = await api.get('/ticker/palestine-news')
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data
    }
    
    // Fallback headlines
    return [
      "تحديثات مباشرة من فلسطين 🇵🇸",
      "أخبار فلسطين اليوم",
      "فلسطين في قلبنا دائماً 🇵🇸"
    ]
  } catch (error) {
    console.error('Error fetching Palestine news:', error)
    // Return fallback headlines on error
    return [
      "تحديثات مباشرة من فلسطين 🇵🇸",
      "أخبار فلسطين اليوم",
      "فلسطين في قلبنا دائماً 🇵🇸"
    ]
  }
}

export default api
