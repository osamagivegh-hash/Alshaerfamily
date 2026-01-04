import React, { useState, useEffect } from 'react'
import PalestineNewsTicker from './NewsTicker'

const NewsTickers = () => {
  const [headerOffset, setHeaderOffset] = useState(120)

  useEffect(() => {
    const calculateOffset = () => {
      const headerEl = document.querySelector('header')
      const offset = headerEl?.offsetHeight ? headerEl.offsetHeight : 120
      setHeaderOffset(offset)
    }

    // Initial measurement
    calculateOffset()

    window.addEventListener('resize', calculateOffset)

    return () => {
      window.removeEventListener('resize', calculateOffset)
    }
  }, [])

  return (
    <div
      id="news-tickers"
      className="fixed w-full z-40 space-y-0"
      style={{ top: `${headerOffset}px` }}
    >
      {/* Palestine Headlines Ticker */}
      <PalestineNewsTicker />
    </div>
  )
}

export default NewsTickers
