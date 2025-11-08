import React, { useState } from 'react'
import { submitContactForm } from '../utils/api'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await submitContactForm(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setError(err.message || 'حدث خطأ في إرسال الرسالة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="bg-gradient-to-b from-olive-50 to-palestine-white py-16">
      <div className="section-container">
        <h2 className="section-title">تواصل معنا</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          نحن نحب سماع أخباركم وقصصكم. تواصلوا معنا لمشاركة ذكرياتكم أو للاستفسار عن أي شيء يخص العائلة
        </p>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="card">
            <h3 className="text-2xl font-bold text-palestine-black mb-6">أرسل رسالة</h3>
            
            {success && (
              <div className="bg-palestine-green/10 border border-palestine-green text-palestine-green p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-xl ml-2">✓</span>
                  <span>تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-palestine-red/10 border border-palestine-red text-palestine-red p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-xl ml-2">✗</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-palestine-black mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-palestine-black mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-palestine-black mb-2">
                  الرسالة *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-textarea"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-palestine-green hover:bg-olive-700 text-white'
                }`}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="card">
              <h3 className="text-2xl font-bold text-palestine-black mb-6">معلومات التواصل</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-palestine-green/10 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-palestine-black mb-1">البريد الإلكتروني</h4>
                    <p className="text-gray-600">info@alshaerfamily.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-palestine-green/10 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-palestine-black mb-1">الهاتف</h4>
                    <p className="text-gray-600">+970 XX XXX XXXX</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-palestine-green/10 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-palestine-black mb-1">العنوان</h4>
                    <p className="text-gray-600">فلسطين - غزة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Values */}
            <div className="card border-r-4 border-palestine-red">
              <h3 className="text-xl font-bold text-palestine-black mb-4">قيم العائلة</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-palestine-green ml-2">•</span>
                  المحبة والتآخي
                </li>
                <li className="flex items-center">
                  <span className="text-palestine-green ml-2">•</span>
                  الحفاظ على التراث
                </li>
                <li className="flex items-center">
                  <span className="text-palestine-green ml-2">•</span>
                  التواصل بين الأجيال
                </li>
                <li className="flex items-center">
                  <span className="text-palestine-green ml-2">•</span>
                  حب الوطن فلسطين
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="card">
              <h3 className="text-xl font-bold text-palestine-black mb-4">تابعونا</h3>
              <div className="flex space-x-reverse space-x-4">
                <button className="w-12 h-12 bg-palestine-green hover:bg-olive-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200">
                  <span className="text-lg">📘</span>
                </button>
                <button className="w-12 h-12 bg-palestine-green hover:bg-olive-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200">
                  <span className="text-lg">📷</span>
                </button>
                <button className="w-12 h-12 bg-palestine-green hover:bg-olive-700 text-white rounded-lg flex items-center justify-center transition-colors duration-200">
                  <span className="text-lg">🐦</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Family Quote */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto border-r-4 border-palestine-green">
            <blockquote className="text-xl md:text-2xl font-bold text-palestine-black mb-4 leading-relaxed">
              "العائلة هي البيت الذي نحمله في قلوبنا أينما ذهبنا"
            </blockquote>
            <cite className="text-lg text-olive-700 font-medium">
              - عائلة الشاعر
            </cite>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
