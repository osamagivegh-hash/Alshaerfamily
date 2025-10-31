import React from 'react'
import { Link } from 'react-router-dom'
import Seo from './Seo'

const NotFound = ({
  title = 'الصفحة غير موجودة',
  message = 'يبدو أننا لم نعثر على ما تبحث عنه.',
  backLink = '/',
  backLabel = 'العودة إلى الصفحة الرئيسية',
  icon = '🕊️',
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-6">
    <Seo title={`${title} | عائلة الشاعر`} description={message} type="website" />
    <div className="max-w-md">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-3xl font-bold text-palestine-black mb-4">{title}</h1>
      <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
      <Link to={backLink} className="btn-primary">
        {backLabel}
      </Link>
    </div>
  </div>
)

export default NotFound
