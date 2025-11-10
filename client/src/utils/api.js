import axios from 'axios'

const API_ROOT = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : ''

const API_BASE_URL = `${API_ROOT}/api`

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
    // Extract data from nested response structure: { success, message, data, timestamp }
    return response.data?.data || response.data || {}
  } catch (error) {
    console.error('Error fetching sections data:', error)
    throw new Error('فشل في جلب البيانات من الخادم')
  }
}

// Fetch specific section data from MongoDB only
export const fetchSectionData = async (section) => {
  try {
    const response = await api.get(`/sections/${section}`)
    // Extract data from nested response structure: { success, message, data, timestamp }
    return response.data?.data || response.data || []
  } catch (error) {
    console.error(`Error fetching ${section} data:`, error)
    throw new Error(`فشل في جلب بيانات ${section} من الخادم`)
  }
}

// Submit contact form
export const submitContactForm = async (formData) => {
  try {
    const response = await api.post('/contact', formData)
    // Extract data from nested response structure: { success, message, data, timestamp }
    return response.data?.data || response.data || {}
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
    // Extract data from nested response structure: { success, message, data, timestamp }
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    throw new Error('فشل في جلب الرسائل')
  }
}

// Fetch Palestine news from server-side API (avoids CORS issues)
export const API_ROOT_URL = API_ROOT || ''

export default api
