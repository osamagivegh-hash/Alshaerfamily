import React, { useState } from 'react'

const FamilyTree = ({ data }) => {
  const [selectedGeneration, setSelectedGeneration] = useState(null)

  if (!data || !data.generations || data.generations.length === 0) {
    return (
      <section id="family-tree" className="bg-olive-50 py-16">
        <div className="section-container">
          <h2 className="section-title">شجرة العائلة</h2>
          <div className="text-center text-gray-500">
            لا توجد بيانات شجرة العائلة متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="family-tree" className="bg-olive-50 py-16">
      <div className="section-container">
        <h2 className="section-title">شجرة العائلة</h2>
        
        {/* Patriarch */}
        {data.patriarch && (
          <div className="text-center mb-12">
            <div className="inline-block bg-palestine-green text-white px-8 py-4 rounded-lg font-bold text-xl mb-4">
              {data.patriarch}
            </div>
            <p className="text-gray-600">رب العائلة</p>
          </div>
        )}
        
        {/* Generations */}
        <div className="space-y-8">
          {data.generations.map((generation) => (
            <div key={generation.generation} className="fade-in">
              <div className="text-center mb-6">
                <button
                  onClick={() => setSelectedGeneration(
                    selectedGeneration === generation.generation ? null : generation.generation
                  )}
                  className="bg-palestine-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
                >
                  الجيل {generation.generation}
                  <span className="mr-2">
                    {selectedGeneration === generation.generation ? '▼' : '▶'}
                  </span>
                </button>
              </div>
              
              {/* Generation Members */}
              <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-300 ${
                selectedGeneration === generation.generation ? 'opacity-100 max-h-none' : 'opacity-50 max-h-20 overflow-hidden'
              }`}>
                {generation.members.map((member, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md border-r-4 border-palestine-red text-center hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <h4 className="font-semibold text-palestine-black">{member}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Tree Visualization */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-palestine-black mb-6">الشجرة التفاعلية</h3>
            <div className="text-center">
              <svg width="100%" height="300" viewBox="0 0 800 300" className="mx-auto">
                {/* Tree trunk */}
                <rect x="395" y="200" width="10" height="100" fill="#8B4513"/>
                
                {/* Branches for each generation */}
                {data.generations.map((generation, genIndex) => {
                  const y = 180 - (genIndex * 60)
                  const branchWidth = 200 + (genIndex * 50)
                  const memberCount = generation.members.length
                  
                  return (
                    <g key={generation.generation}>
                      {/* Horizontal branch */}
                      <line 
                        x1={400 - branchWidth/2} 
                        y1={y} 
                        x2={400 + branchWidth/2} 
                        y2={y} 
                        stroke="#8B4513" 
                        strokeWidth="3"
                      />
                      
                      {/* Vertical connection to main trunk */}
                      <line 
                        x1="400" 
                        y1={y} 
                        x2="400" 
                        y2={y + 20} 
                        stroke="#8B4513" 
                        strokeWidth="3"
                      />
                      
                      {/* Member nodes */}
                      {generation.members.slice(0, 6).map((member, memberIndex) => {
                        const x = 400 - branchWidth/2 + (memberIndex * (branchWidth / Math.min(memberCount, 6)))
                        return (
                          <g key={memberIndex}>
                            <circle cx={x} cy={y - 15} r="8" fill="#738249"/>
                            <text 
                              x={x} 
                              y={y - 25} 
                              textAnchor="middle" 
                              fontSize="10" 
                              fill="#333"
                            >
                              {member.split(' ')[0]}
                            </text>
                          </g>
                        )
                      })}
                    </g>
                  )
                })}
              </svg>
            </div>
            <p className="text-gray-600 mt-4">
              انقر على أرقام الأجيال أعلاه لاستكشاف أفراد كل جيل
            </p>
          </div>
        </div>
        
        {/* Add Member Button */}
        <div className="text-center mt-12">
          <button className="btn-primary">
            إضافة فرد جديد للعائلة
          </button>
        </div>
      </div>
    </section>
  )
}

export default FamilyTree
