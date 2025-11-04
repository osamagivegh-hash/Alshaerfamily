import React, { useState } from 'react'
import adminApi, { adminUpload } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import { normalizeImageUrl } from '../../utils/imageUtils'

const ImageUpload = ({ 
  value = '', 
  onChange, 
  label = 'صورة', 
  required = false,
  accept = 'image/*',
  showPreview = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يجب اختيار ملف صورة فقط')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
      return
    }

    setUploading(true)
    try {
      // Upload image using adminUpload utility
      const response = await adminUpload.uploadImage(file)

      // Normalize the image URL
      const imageUrl = normalizeImageUrl(response.url)

      // Set preview
      setPreview(imageUrl)
      
      // Call onChange with the normalized image URL
      if (onChange) {
        onChange(imageUrl)
      }

      toast.success('تم رفع الصورة بنجاح')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || error.message || 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlInput = (e) => {
    const url = e.target.value
    setPreview(url)
    if (onChange) {
      onChange(url)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (onChange) {
      onChange('')
    }
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-palestine-black mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* URL Input Option */}
      <div className="mb-3">
        <input
          type="url"
          value={value || ''}
          onChange={handleUrlInput}
          placeholder="أو أدخل رابط الصورة مباشرة"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
          dir="ltr"
        />
        <p className="text-xs text-gray-500 mt-1">يمكنك إدخال رابط صورة من الإنترنت</p>
      </div>

      <div className="flex items-center gap-4">
        {/* File Upload */}
        <div className="flex-1">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palestine-green mb-2"></div>
                  <p className="text-sm text-gray-600">جاري الرفع...</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">اضغط للاختيار</span> أو اسحب الصورة هنا
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF أو WEBP (حد أقصى 5MB)</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="mt-4 relative">
          <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={normalizeImageUrl(preview)}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              onError={() => {
                toast.error('فشل تحميل الصورة')
                setPreview(null)
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            title="حذف الصورة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
