import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-palestine-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-palestine-green border-t-transparent mx-auto mb-4"></div>
        <p className="text-palestine-black font-medium">جاري التحميل...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
