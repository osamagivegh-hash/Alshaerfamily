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

export default api
