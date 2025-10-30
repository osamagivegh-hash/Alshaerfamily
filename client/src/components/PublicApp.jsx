import React, { useState, useEffect } from 'react'
import Header from './Header'
import Hero from './Hero'
import News from './News'
import Conversations from './Conversations'
import FamilyTree from './FamilyTree'
import Palestine from './Palestine'
import Articles from './Articles'
import Gallery from './Gallery'
import Contact from './Contact'
import Footer from './Footer'
import LoadingSpinner from './LoadingSpinner'
import { fetchSectionsData } from '../utils/api'

const PublicApp = () => {
  const [sectionsData, setSectionsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSectionsData()
        setSectionsData(data)
      } catch (err) {
        setError('فشل في تحميل البيانات')
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-palestine-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-palestine-red mb-4">خطأ في التحميل</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <News data={sectionsData?.news || []} />
        <Conversations data={sectionsData?.conversations || []} />
        <FamilyTree data={sectionsData?.familyTree || {}} />
        <Palestine data={sectionsData?.palestine || []} />
        <Articles data={sectionsData?.articles || []} />
        <Gallery data={sectionsData?.gallery || []} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default PublicApp
