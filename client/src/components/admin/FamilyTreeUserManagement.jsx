import React, { useState, useEffect } from 'react'
import { useFamilyTreeAuth } from '../../contexts/FamilyTreeAuthContext'
import { familyTreeUserApi } from '../../utils/familyTreeApi'
import toast from 'react-hot-toast'

const FamilyTreeUserManagement = () => {
    const { user, isFTSuperAdmin } = useFamilyTreeAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        role: 'ft-editor',
        isActive: true
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await familyTreeUserApi.getUsers()
            setUsers(response.data || [])
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Validation
            if (!formData.username || !formData.displayName || !formData.email) {
                toast.error('جميع الحقول الأساسية مطلوبة')
                return
            }

            if (!editingUser && !formData.password) {
                toast.error('كلمة المرور مطلوبة للمستخدم الجديد')
                return
            }

            if (editingUser) {
                // Update
                const updateData = {
                    displayName: formData.displayName,
                    role: formData.role,
                    isActive: formData.isActive
                }
                if (formData.password) updateData.password = formData.password

                await familyTreeUserApi.updateUser(editingUser._id, updateData)
                toast.success('تم تحديث المستخدم بنجاح')
            } else {
                // Create
                await familyTreeUserApi.createUser(formData)
                toast.success('تم إنشاء المستخدم بنجاح')
            }

            setShowModal(false)
            setEditingUser(null)
            resetForm()
            fetchUsers()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
        try {
            await familyTreeUserApi.deleteUser(id)
            toast.success('تم حذف المستخدم بنجاح')
            fetchUsers()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            password: '',
            role: user.role,
            isActive: user.isActive
        })
        setShowModal(true)
    }

    const openCreateModal = () => {
        setEditingUser(null)
        resetForm()
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            username: '',
            displayName: '',
            email: '',
            password: '',
            role: 'ft-editor',
            isActive: true
        })
    }

    if (!isFTSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <span className="text-6xl mb-4">🚫</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح بالوصول</h2>
                <p className="text-gray-600">هذه الصفحة متاحة فقط للمدير الأعلى لشجرة العائلة.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-l from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        إدارة مستخدمي شجرة العائلة
                    </h2>
                    <p className="text-gray-500">إضافة وتعديل صلاحيات مدراء النظام</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
                >
                    <span>➕</span>
                    مستخدم جديد
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-500">جاري تحميل المستخدمين...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">المستخدم</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الدور</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                                    {admin.displayName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{admin.displayName}</p>
                                                    <p className="text-xs text-gray-500">@{admin.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                ${admin.role === 'ft-super-admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-emerald-100 text-emerald-700'}`}>
                                                {admin.role === 'ft-super-admin' ? 'مدير أعلى' : 'محرر'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${admin.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'}`}>
                                                {admin.isActive ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    ✏️
                                                </button>
                                                {admin._id !== user?.id && (
                                                    <button
                                                        onClick={() => handleDelete(admin._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="حذف"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!!editingUser}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم المعروض</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!!editingUser}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingUser ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    dir="ltr"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="ft-editor">محرر (Editor)</option>
                                        <option value="ft-super-admin">مدير أعلى (Super Admin)</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-700">حساب نشط</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
                                >
                                    {editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FamilyTreeUserManagement
