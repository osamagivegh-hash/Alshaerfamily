import axios from 'axios'

// Use relative URLs for both dev and production
// Vite proxy handles development routing
const ADMIN_API_BASE_URL = '/api/admin'

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 second timeout
})

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't override Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth functions
export const adminAuth = {
  login: async (credentials) => {
    try {
      const response = await adminApi.post('/login', credentials)
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تسجيل الدخول')
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/admin/login'
  },

  verifyToken: async () => {
    try {
      const response = await adminApi.get('/verify')
      return response.data
    } catch (error) {
      throw new Error('رمز الوصول غير صالح')
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await adminApi.post('/change-password', passwordData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تغيير كلمة المرور')
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken')
  }
}

// Dashboard functions
export const adminDashboard = {
  getStats: async () => {
    try {
      const response = await adminApi.get('/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب الإحصائيات')
    }
  }
}

// Generic CRUD functions
const createCRUDFunctions = (endpoint) => ({
  getAll: async () => {
    try {
      const response = await adminApi.get(`/${endpoint}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في جلب ${endpoint}`)
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/${endpoint}/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في جلب ${endpoint}`)
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post(`/${endpoint}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في إضافة ${endpoint}`)
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.put(`/${endpoint}/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في تحديث ${endpoint}`)
    }
  },

  delete: async (id) => {
    try {
      const response = await adminApi.delete(`/${endpoint}/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في حذف ${endpoint}`)
    }
  },

  bulkDelete: async (ids) => {
    try {
      const response = await adminApi.post(`/bulk-delete/${endpoint}`, { ids })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || `خطأ في الحذف المجمع`)
    }
  }
})

// Section-specific APIs
export const adminNews = createCRUDFunctions('news')
export const adminConversations = createCRUDFunctions('conversations')
export const adminArticles = createCRUDFunctions('articles')
export const adminPalestine = createCRUDFunctions('palestine')
export const adminGallery = createCRUDFunctions('gallery')

// Family Tree API (special case)
export const adminFamilyTree = {
  get: async () => {
    try {
      const response = await adminApi.get('/family-tree')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب شجرة العائلة')
    }
  },

  update: async (data) => {
    try {
      const response = await adminApi.put('/family-tree', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تحديث شجرة العائلة')
    }
  }
}

// Contacts API
export const adminContacts = {
  getAll: async () => {
    try {
      const response = await adminApi.get('/contacts')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في جلب الرسائل')
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await adminApi.put(`/contacts/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في تحديث حالة الرسالة')
    }
  },

  delete: async (id) => {
    try {
      const response = await adminApi.delete(`/contacts/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في حذف الرسالة')
    }
  }
}

// File upload API
export const adminUpload = {
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await adminApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'خطأ في رفع الصورة')
    }
  }
}

export default adminApi
