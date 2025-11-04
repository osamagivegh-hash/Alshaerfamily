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
      const sections = ['hero', 'news', 'conversations', 'family-tree', 'palestine', 'articles', 'gallery', 'contact']
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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navItems = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'news', label: 'الأخبار' },
    { id: 'conversations', label: 'حوارات' },
    { id: 'family-tree', label: 'شجرة العائلة' },
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
      {/* Country Flags - Top Right Corner */}
      <div className="absolute top-1 left-1 md:top-2 md:left-2 flex items-center gap-1.5 z-10">
        {/* Palestine Flag */}
        <div 
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm relative overflow-hidden"
          title="فلسطين"
        >
          {/* Black stripe */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-black"></div>
          {/* White stripe */}
          <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-white"></div>
          {/* Green stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ backgroundColor: '#007A3D' }}></div>
          {/* Red triangle */}
          <div className="absolute right-0 top-0 bottom-0 w-0 h-0" style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '12px solid #CE1126'
          }}></div>
        </div>
        
        {/* Egypt Flag */}
        <div 
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm relative overflow-hidden"
          title="مصر"
        >
          {/* Red stripe */}
          <div className="absolute top-0 left-0 right-0 h-1/3" style={{ backgroundColor: '#CE1126' }}></div>
          {/* White stripe */}
          <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-white"></div>
          {/* Black stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black"></div>
        </div>
        
        {/* Saudi Arabia Flag */}
        <div 
          className="w-7 h-5 md:w-9 md:h-6 border border-gray-300 shadow-sm rounded-sm relative overflow-hidden"
          title="السعودية"
          style={{ backgroundColor: '#007A3D' }}
        >
          {/* Shahada text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[7px] md:text-[9px] font-bold leading-tight" style={{ fontFamily: 'serif' }}>
              لا إله إلا الله
            </span>
          </div>
          {/* Sword (simplified) */}
          <div className="absolute right-0 top-0 bottom-0 w-0 h-0" style={{
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderRight: '10px solid #007A3D'
          }}></div>
        </div>
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
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-link px-3 py-2 text-sm transition-colors duration-200 ${
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
