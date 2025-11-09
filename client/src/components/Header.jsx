import React, { useState, useEffect } from 'react'
import SearchBar from './common/SearchBar'
import MobileMenu from './common/MobileMenu'
import NewsTicker from './NewsTicker'

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

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg backdrop-blur-sm' 
        : 'bg-white/90'
    }`}>
      <NewsTicker />
      {/* Country Flags - Top Right Corner */}
      <div className="absolute top-1 left-1 md:top-2 md:left-2 flex items-center gap-1.5 z-10">
        {/* Palestine Flag */}
        <img
          src="https://flagcdn.com/w40/ps.png"
          alt="فلسطين"
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm object-cover"
          title="فلسطين"
          onError={(e) => {
            // Fallback to SVG if image fails to load
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <svg
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm"
          viewBox="0 0 900 600"
          style={{ display: 'none' }}
          title="فلسطين"
        >
          <rect width="900" height="200" fill="#000000" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#007A3D" />
          <polygon points="0,0 0,600 300,300" fill="#CE1126" />
        </svg>
        
        {/* Egypt Flag */}
        <img
          src="https://flagcdn.com/w40/eg.png"
          alt="مصر"
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm object-cover"
          title="مصر"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <svg
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm"
          viewBox="0 0 900 600"
          style={{ display: 'none' }}
          title="مصر"
        >
          <rect width="900" height="200" fill="#CE1126" />
          <rect y="200" width="900" height="200" fill="#FFFFFF" />
          <rect y="400" width="900" height="200" fill="#000000" />
        </svg>
        
        {/* Saudi Arabia Flag */}
        <img
          src="https://flagcdn.com/w40/sa.png"
          alt="السعودية"
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm object-cover"
          title="السعودية"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
        <svg
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm"
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
      </div>
      
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-palestine-black">
              عائلة الشاعر
            </h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex space-x-reverse space-x-8">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-link px-4 py-2 text-base font-semibold transition-colors duration-200 ${
                    activeSection === item.id 
                      ? 'text-palestine-green border-b-2 border-palestine-green' 
                      : 'text-palestine-black hover:text-palestine-green'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-palestine-black hover:text-palestine-green p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="فتح القائمة"
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
