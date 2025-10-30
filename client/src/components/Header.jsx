import React, { useState, useEffect } from 'react'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

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

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg backdrop-blur-sm' 
        : 'bg-white/90'
    }`}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-palestine-black">
              عائلة الشاعر
            </h1>
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
            <button className="text-palestine-black hover:text-palestine-green">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block px-3 py-2 text-base font-medium w-full text-right ${
                  activeSection === item.id 
                    ? 'text-palestine-green bg-palestine-green/10' 
                    : 'text-palestine-black hover:text-palestine-green hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
