import React from 'react'

const Conversations = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section id="conversations" className="bg-palestine-white py-16">
        <div className="section-container">
          <h2 className="section-title">حوارات</h2>
          <div className="text-center text-gray-500">
            لا توجد حوارات متاحة حالياً
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="conversations" className="bg-palestine-white py-16">
      <div className="section-container">
        <h2 className="section-title">حوارات</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          حوارات شيقة مع أفراد العائلة حول تاريخنا وذكرياتنا وتجاربنا في الحياة
        </p>
        
        <div className="space-y-8">
          {data.map((conversation) => (
            <div key={conversation.id} className="card slide-in-right">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <h3 className="text-2xl font-bold text-palestine-black mb-2 lg:mb-0">
                  {conversation.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(conversation.date).toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-palestine-green mb-2">المشاركون:</h4>
                <div className="flex flex-wrap gap-2">
                  {conversation.participants.map((participant, index) => (
                    <span 
                      key={index}
                      className="bg-olive-100 text-olive-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                {conversation.content}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button className="btn-primary text-sm">
                  استمع للحوار
                </button>
                <button className="text-palestine-green hover:text-olive-700 font-medium text-sm transition-colors duration-200">
                  قراءة النص كاملاً ←
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Conversation Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            شارك حواراً جديداً
          </button>
        </div>
      </div>
    </section>
  )
}

export default Conversations
