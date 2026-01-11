import React, { useState, useEffect } from 'react'
import SearchBar from './common/SearchBar'
import MobileMenu from './common/MobileMenu'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Update active section based on scroll position
      const sections = ['hero', 'news', 'conversations', 'palestine', 'articles', 'gallery', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    // للرئيسية نذهب لأعلى الصفحة تماماً
    if (sectionId === 'hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return
    }

    const element = document.getElementById(sectionId)
    if (!element) return

    const headerEl = document.querySelector('header')
    const tickerEl = document.getElementById('news-tickers')
    const headerHeight = headerEl?.offsetHeight || 0
    const tickerHeight = tickerEl?.offsetHeight || 0
    const offset = headerHeight + tickerHeight + 20 // small margin

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const targetPosition = Math.max(elementPosition - offset, 0)

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }

  const navItems = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'news', label: 'الأخبار' },
    { id: 'conversations', label: 'حوارات' },
    { id: 'palestine', label: 'فلسطين' },
    { id: 'articles', label: 'مقالات' },
    { id: 'gallery', label: 'معرض الصور' },
    { id: 'contact', label: 'تواصل معنا' },
  ]

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // أيقونة العائلة/الأشخاص
  const FamilyPresenceIcon = () => (
    <svg
      className="w-4 h-4 md:w-5 md:h-5 text-palestine-green"
      viewBox="0 0 24 24"
      fill="currentColor"
      title="تواجد العائلة"
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  )

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
      ? 'bg-white/95 shadow-xl backdrop-blur-md border-b border-gray-100'
      : 'bg-gradient-to-b from-white via-white/98 to-white/95'
      }`}>
      {/* شريط زخرفي علوي بألوان فلسطين */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-gradient-to-r from-palestine-black to-palestine-black/80"></div>
        <div className="flex-1 bg-gradient-to-r from-white to-gray-100 border-y border-gray-200"></div>
        <div className="flex-1 bg-gradient-to-r from-palestine-green/80 to-palestine-green"></div>
        <div className="flex-1 bg-gradient-to-r from-palestine-red to-palestine-red/80"></div>
      </div>

      {/* Country Flags with Family Presence Icon - Top Left Corner */}
      <div className="absolute top-3 left-2 md:top-4 md:left-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200/50">
        {/* أيقونة تواجد العائلة */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
          <FamilyPresenceIcon />
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">تواجد العائلة</span>
        </div>

        {/* Palestine Flag */}
        <div className="relative group">
          <img
            src="https://flagcdn.com/w40/ps.png"
            alt="فلسطين"
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded object-cover transition-transform duration-300 group-hover:scale-110"
            title="فلسطين - الوطن الأم"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <svg
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded"
            viewBox="0 0 900 600"
            style={{ display: 'none' }}
            title="فلسطين"
          >
            <rect width="900" height="200" fill="#000000" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#007A3D" />
            <polygon points="0,0 0,600 300,300" fill="#CE1126" />
          </svg>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            فلسطين
          </div>
        </div>

        {/* Egypt Flag */}
        <div className="relative group">
          <img
            src="https://flagcdn.com/w40/eg.png"
            alt="مصر"
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded object-cover transition-transform duration-300 group-hover:scale-110"
            title="مصر"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <svg
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded"
            viewBox="0 0 900 600"
            style={{ display: 'none' }}
            title="مصر"
          >
            <rect width="900" height="200" fill="#CE1126" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#000000" />
          </svg>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            مصر
          </div>
        </div>

        {/* Jordan Flag */}
        <div className="relative group">
          <img
            src="https://flagcdn.com/w40/jo.png"
            alt="الأردن"
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded object-cover transition-transform duration-300 group-hover:scale-110"
            title="الأردن"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <svg
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded"
            viewBox="0 0 900 600"
            style={{ display: 'none' }}
            title="الأردن"
          >
            <rect width="900" height="200" fill="#000000" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#007A3D" />
            <polygon points="0,0 0,600 300,300" fill="#CE1126" />
            <circle cx="120" cy="300" r="15" fill="#FFFFFF" />
          </svg>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            الأردن
          </div>
        </div>

        {/* Saudi Arabia Flag */}
        <div className="relative group">
          <img
            src="https://flagcdn.com/w40/sa.png"
            alt="السعودية"
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded object-cover transition-transform duration-300 group-hover:scale-110"
            title="السعودية"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <svg
            className="w-7 h-5 md:w-8 md:h-5 border border-gray-300 shadow-sm rounded"
            viewBox="0 0 900 600"
            style={{ display: 'none' }}
            title="السعودية"
          >
            <rect width="900" height="600" fill="#007A3D" />
            <text
              x="450"
              y="300"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              fontSize="200"
              fontFamily="serif"
              fontWeight="bold"
            >
              لا إله إلا الله
            </text>
          </svg>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            السعودية
          </div>
        </div>
      </div>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-1">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 group">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-palestine-black via-palestine-green to-palestine-red bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
              عائلة الشاعر
            </h1>
            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-palestine-green to-palestine-red transition-all duration-300"></div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation - مع إصلاح pointer-events */}
          <div className="hidden md:block relative z-50">
            <div className="flex items-center space-x-reverse space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-inner">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer select-none ${activeSection === item.id
                    ? 'bg-gradient-to-r from-palestine-green to-olive-600 text-white shadow-lg shadow-palestine-green/30 scale-105'
                    : 'text-gray-700 hover:text-palestine-green hover:bg-white hover:shadow-md'
                    }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden relative z-50">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-palestine-black hover:text-palestine-green p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md"
              aria-label="فتح القائمة"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
    </header>
  )
}

export default Header
