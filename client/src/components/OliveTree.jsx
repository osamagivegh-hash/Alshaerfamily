import React from 'react'

const OliveTree = () => {
  return (
    <div className="olive-tree">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tree trunk */}
        <rect x="95" y="120" width="10" height="60" fill="#8B4513" rx="2"/>
        
        {/* Main branches */}
        <path d="M100 120 Q85 110 75 100" stroke="#8B4513" strokeWidth="3" fill="none"/>
        <path d="M100 120 Q115 110 125 100" stroke="#8B4513" strokeWidth="3" fill="none"/>
        <path d="M100 135 Q80 125 65 120" stroke="#8B4513" strokeWidth="2" fill="none"/>
        <path d="M100 135 Q120 125 135 120" stroke="#8B4513" strokeWidth="2" fill="none"/>
        
        {/* Leaves clusters */}
        <ellipse cx="75" cy="95" rx="15" ry="12" fill="#738249" opacity="0.9"/>
        <ellipse cx="125" cy="95" rx="15" ry="12" fill="#738249" opacity="0.9"/>
        <ellipse cx="65" cy="115" rx="12" ry="10" fill="#8fa05f" opacity="0.8"/>
        <ellipse cx="135" cy="115" rx="12" ry="10" fill="#8fa05f" opacity="0.8"/>
        <ellipse cx="100" cy="85" rx="20" ry="15" fill="#5a653a" opacity="0.9"/>
        
        {/* Additional foliage */}
        <ellipse cx="90" cy="105" rx="8" ry="6" fill="#738249" opacity="0.7"/>
        <ellipse cx="110" cy="105" rx="8" ry="6" fill="#738249" opacity="0.7"/>
        <ellipse cx="85" cy="125" rx="6" ry="5" fill="#8fa05f" opacity="0.6"/>
        <ellipse cx="115" cy="125" rx="6" ry="5" fill="#8fa05f" opacity="0.6"/>
        
        {/* Olives */}
        <circle cx="70" cy="100" r="2" fill="#2D4A2B"/>
        <circle cx="130" cy="100" r="2" fill="#2D4A2B"/>
        <circle cx="95" cy="90" r="2" fill="#2D4A2B"/>
        <circle cx="105" cy="90" r="2" fill="#2D4A2B"/>
        <circle cx="80" cy="120" r="2" fill="#2D4A2B"/>
        <circle cx="120" cy="120" r="2" fill="#2D4A2B"/>
        
        {/* Ground/roots indication */}
        <ellipse cx="100" cy="185" rx="25" ry="3" fill="#D2B48C" opacity="0.3"/>
      </svg>
    </div>
  )
}

export default OliveTree
