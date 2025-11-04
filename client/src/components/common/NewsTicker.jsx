import React from 'react'

const NewsTicker = ({ items, label, bgColor = 'bg-palestine-green', textColor = 'text-white', borderColor = 'border-palestine-green', isThin = false }) => {
  if (!items || items.length === 0) {
    return null
  }

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items]
  const animationDuration = Math.max(items.length * 4, 20) // Minimum 20 seconds

  // Use thinner padding for black ticker
  const paddingClass = isThin ? 'py-1.5' : 'py-2.5'
  const textSizeClass = isThin ? 'text-xs md:text-sm' : 'text-sm md:text-base'

  return (
    <div className={`${bgColor} ${textColor} ${paddingClass} overflow-hidden border-b ${borderColor} border-opacity-30 shadow-sm`}>
      <div className="flex items-center h-full">
        {/* Label */}
        <div className="flex-shrink-0 px-4 md:px-6 font-bold text-xs md:text-sm whitespace-nowrap border-l border-opacity-30 ml-4 bg-black bg-opacity-10 py-1">
          {label}
        </div>
        
        {/* Marquee container */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="flex whitespace-nowrap"
            style={{
              animation: `marquee-rtl ${animationDuration}s linear infinite`
            }}
          >
            {duplicatedItems.map((item, index) => (
              <span key={index} className={`px-6 md:px-8 ${textSizeClass} inline-block`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

export default NewsTicker
