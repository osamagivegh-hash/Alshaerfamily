import React, { useState, useEffect } from 'react'
import { adminFamilyTree } from '../../utils/adminApi'
import toast from 'react-hot-toast'
import LoadingSpinner from '../LoadingSpinner'

const AdminFamilyTree = () => {
  const [familyTree, setFamilyTree] = useState({ patriarch: '', generations: [] })
  const [loading, setLoading] = useState(true)
  const [editingGeneration, setEditingGeneration] = useState(null)
  const [newMember, setNewMember] = useState('')

  useEffect(() => {
    fetchFamilyTree()
  }, [])

  const fetchFamilyTree = async () => {
    try {
      const data = await adminFamilyTree.get()
      setFamilyTree(data || { patriarch: '', generations: [] })
    } catch (error) {
      toast.error(error.message)
      setFamilyTree({ patriarch: '', generations: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminFamilyTree.update(familyTree)
      toast.success('تم تحديث شجرة العائلة بنجاح')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addGeneration = () => {
    const newGeneration = {
      generation: familyTree.generations.length + 1,
      members: []
    }
    setFamilyTree({
      ...familyTree,
      generations: [...familyTree.generations, newGeneration]
    })
  }

  const removeGeneration = (index) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجيل؟')) return
    
    const newGenerations = familyTree.generations.filter((_, i) => i !== index)
    // Re-number generations
    const renumberedGenerations = newGenerations.map((gen, i) => ({
      ...gen,
      generation: i + 1
    }))
    
    setFamilyTree({
      ...familyTree,
      generations: renumberedGenerations
    })
  }

  const addMember = (generationIndex) => {
    if (!newMember.trim()) {
      toast.error('يرجى إدخال اسم العضو')
      return
    }

    const newGenerations = [...familyTree.generations]
    newGenerations[generationIndex].members.push(newMember.trim())
    
    setFamilyTree({
      ...familyTree,
      generations: newGenerations
    })
    
    setNewMember('')
    setEditingGeneration(null)
  }

  const removeMember = (generationIndex, memberIndex) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return
    
    const newGenerations = [...familyTree.generations]
    newGenerations[generationIndex].members.splice(memberIndex, 1)
    
    setFamilyTree({
      ...familyTree,
      generations: newGenerations
    })
  }

  const editMember = (generationIndex, memberIndex, newName) => {
    if (!newName.trim()) return
    
    const newGenerations = [...familyTree.generations]
    newGenerations[generationIndex].members[memberIndex] = newName.trim()
    
    setFamilyTree({
      ...familyTree,
      generations: newGenerations
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-palestine-black">إدارة شجرة العائلة</h1>
          <p className="text-gray-600 mt-1">تحديث معلومات أفراد العائلة والأجيال</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={addGeneration}
            className="bg-olive-600 text-white px-4 py-2 rounded-lg hover:bg-olive-700 transition-colors duration-200"
          >
            إضافة جيل جديد
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Patriarch Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-palestine-black mb-4">رب العائلة</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-palestine-black mb-2">
            اسم رب العائلة
          </label>
          <input
            type="text"
            value={familyTree.patriarch}
            onChange={(e) => setFamilyTree({...familyTree, patriarch: e.target.value})}
            className="form-input"
            placeholder="أدخل اسم رب العائلة"
          />
        </div>
      </div>

      {/* Generations */}
      <div className="space-y-6">
        {familyTree.generations.map((generation, genIndex) => (
          <div key={generation.generation} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-palestine-black">
                الجيل {generation.generation}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGeneration(genIndex)}
                  className="bg-palestine-green text-white px-3 py-1 rounded text-sm hover:bg-olive-700 transition-colors duration-200"
                >
                  إضافة عضو
                </button>
                <button
                  onClick={() => removeGeneration(genIndex)}
                  className="bg-palestine-red text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors duration-200"
                >
                  حذف الجيل
                </button>
              </div>
            </div>

            {/* Add Member Form */}
            {editingGeneration === genIndex && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="اسم العضو الجديد"
                    className="form-input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addMember(genIndex)
                      }
                    }}
                  />
                  <button
                    onClick={() => addMember(genIndex)}
                    className="btn-primary"
                  >
                    إضافة
                  </button>
                  <button
                    onClick={() => {
                      setEditingGeneration(null)
                      setNewMember('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            {generation.members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>لا يوجد أعضاء في هذا الجيل</p>
                <p className="text-sm">انقر على "إضافة عضو" لإضافة أعضاء جدد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generation.members.map((member, memberIndex) => (
                  <div key={memberIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-palestine-green rounded-full flex items-center justify-center ml-3">
                          <span className="text-white text-lg">👤</span>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={member}
                            onChange={(e) => editMember(genIndex, memberIndex, e.target.value)}
                            className="font-semibold text-palestine-black bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                            onBlur={(e) => editMember(genIndex, memberIndex, e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeMember(genIndex, memberIndex)}
                        className="text-palestine-red hover:bg-red-50 p-1 rounded transition-colors duration-200"
                        title="حذف العضو"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 text-center">
              عدد الأعضاء: {generation.members.length}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {familyTree.generations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold mb-2">لا توجد أجيال في شجرة العائلة</h3>
          <p className="mb-4">ابدأ ببناء شجرة العائلة بإضافة الأجيال والأعضاء</p>
          <button
            onClick={addGeneration}
            className="btn-primary"
          >
            إضافة الجيل الأول
          </button>
        </div>
      )}

      {/* Statistics */}
      {familyTree.generations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-palestine-black mb-4">إحصائيات شجرة العائلة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-palestine-green/10 rounded-lg">
              <div className="text-2xl font-bold text-palestine-green">
                {familyTree.generations.length}
              </div>
              <div className="text-sm text-gray-600">عدد الأجيال</div>
            </div>
            
            <div className="text-center p-4 bg-olive-100 rounded-lg">
              <div className="text-2xl font-bold text-olive-700">
                {familyTree.generations.reduce((total, gen) => total + gen.members.length, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...familyTree.generations.map(gen => gen.members.length), 0)}
              </div>
              <div className="text-sm text-gray-600">أكبر جيل</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-olive-50 border border-olive-200 rounded-lg p-4">
        <h4 className="font-semibold text-olive-800 mb-2">تعليمات:</h4>
        <ul className="text-sm text-olive-700 space-y-1">
          <li>• انقر على اسم أي عضو لتعديله مباشرة</li>
          <li>• استخدم "إضافة جيل جديد" لإضافة جيل جديد</li>
          <li>• يمكنك حذف أي جيل أو عضو باستخدام أزرار الحذف</li>
          <li>• لا تنس حفظ التغييرات بعد الانتهاء من التعديل</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminFamilyTree
