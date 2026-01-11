/**
 * Admin User Management Component
 * Super Admin can manage users, create editors, and reset passwords
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

// Permission options
const PERMISSIONS = [
    { value: 'family-tree', label: 'شجرة العائلة', icon: '🌳' },
    { value: 'dev-team', label: 'فريق التطوير', icon: '👨‍💻' },
    { value: 'news', label: 'الأخبار', icon: '📰' },
    { value: 'articles', label: 'المقالات', icon: '📝' },
    { value: 'conversations', label: 'الحوارات', icon: '💬' },
    { value: 'gallery', label: 'المعرض', icon: '🖼️' },
    { value: 'contacts', label: 'الرسائل', icon: '✉️' },
    { value: 'palestine', label: 'فلسطين', icon: '🇵🇸' },
    { value: 'settings', label: 'الإعدادات', icon: '⚙️' }
];

// Role options
const ROLES = [
    { value: 'super-admin', label: 'مدير أعلى', color: 'bg-purple-100 text-purple-700' },
    { value: 'admin', label: 'مدير', color: 'bg-blue-100 text-blue-700' },
    { value: 'editor', label: 'محرر', color: 'bg-green-100 text-green-700' }
];

const AdminUserManagement = () => {
    const { user: currentUser } = useAdmin();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
        role: 'editor',
        permissions: ['family-tree'],
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data || []);
            } else {
                toast.error(data.message || 'خطأ في جلب المستخدمين');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم إنشاء المستخدم بنجاح');
                setShowAddModal(false);
                resetForm();
                fetchUsers();
            } else {
                toast.error(data.message || 'خطأ في إنشاء المستخدم');
            }
        } catch (error) {
            console.error('Create user error:', error);
            toast.error('خطأ في إنشاء المستخدم');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم تحديث المستخدم بنجاح');
                setShowEditModal(false);
                fetchUsers();
            } else {
                toast.error(data.message || 'خطأ في تحديث المستخدم');
            }
        } catch (error) {
            console.error('Update user error:', error);
            toast.error('خطأ في تحديث المستخدم');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم حذف المستخدم بنجاح');
                fetchUsers();
            } else {
                toast.error(data.message || 'خطأ في حذف المستخدم');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            toast.error('خطأ في حذف المستخدم');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!formData.password) {
            toast.error('كلمة المرور مطلوبة');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ newPassword: formData.password })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم تغيير كلمة المرور بنجاح');
                setShowPasswordModal(false);
                setFormData({ ...formData, password: '' });
            } else {
                toast.error(data.message || 'خطأ في تغيير كلمة المرور');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('خطأ في تغيير كلمة المرور');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            displayName: user.displayName || '',
            role: user.role,
            permissions: user.permissions || [],
            isActive: user.isActive !== false
        });
        setShowEditModal(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setFormData({ ...formData, password: '' });
        setShowPasswordModal(true);
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            displayName: '',
            role: 'editor',
            permissions: ['family-tree'],
            isActive: true
        });
    };

    const togglePermission = (permission) => {
        const current = formData.permissions || [];
        if (current.includes(permission)) {
            setFormData({ ...formData, permissions: current.filter(p => p !== permission) });
        } else {
            setFormData({ ...formData, permissions: [...current, permission] });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'لم يسجل دخول';
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleInfo = (role) => {
        return ROLES.find(r => r.value === role) || ROLES[2];
    };

    // Check if current user is super-admin
    if (currentUser?.role !== 'super-admin') {
        return (
            <div className="text-center py-12" dir="rtl">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">صلاحيات غير كافية</h2>
                <p className="text-gray-600">هذه الصفحة متاحة فقط للمدير الأعلى</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">👥 إدارة المستخدمين</h1>
                <p className="text-purple-100">إنشاء وإدارة حسابات المستخدمين والصلاحيات</p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">إجمالي المستخدمين: {users.length}</span>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                    <span>+</span>
                    <span>إضافة مستخدم</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">المستخدم</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">الدور</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">الصلاحيات</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">آخر دخول</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(user => {
                                const roleInfo = getRoleInfo(user.role);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                                    {(user.displayName || user.username)?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.displayName || user.username}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-gray-400">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                                                {roleInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.permissions || []).slice(0, 3).map(p => {
                                                    const perm = PERMISSIONS.find(x => x.value === p);
                                                    return (
                                                        <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            {perm?.icon} {perm?.label}
                                                        </span>
                                                    );
                                                })}
                                                {(user.permissions || []).length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        +{user.permissions.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isActive ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(user.lastLogin)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                    title="تعديل"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => openPasswordModal(user)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                                                    title="تغيير كلمة المرور"
                                                >
                                                    🔑
                                                </button>
                                                {user.role !== 'super-admin' && user.username !== currentUser?.username && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                                        title="حذف"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Default Editor Info */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                <h3 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                    <span>🌳</span>
                    <span>محرر شجرة العائلة الافتراضي</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">اسم المستخدم:</span>
                        <code className="mr-2 bg-white px-2 py-1 rounded border">tree_editor</code>
                    </div>
                    <div>
                        <span className="text-gray-600">كلمة المرور الافتراضية:</span>
                        <code className="mr-2 bg-white px-2 py-1 rounded border">TreeEditor@2024</code>
                    </div>
                </div>
                <p className="text-teal-700 text-sm mt-3">
                    ⚠️ يُنصح بتغيير كلمة المرور الافتراضية فوراً من خلال زر 🔑 أعلاه
                </p>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">إضافة مستخدم جديد</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="username"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم المعروض</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="الاسم بالعربي"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {PERMISSIONS.map(perm => (
                                        <label key={perm.value} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions?.includes(perm.value)}
                                                onChange={() => togglePermission(perm.value)}
                                                className="w-4 h-4"
                                            />
                                            <span>{perm.icon}</span>
                                            <span className="text-sm">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">إنشاء المستخدم</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">تعديل المستخدم: {selectedUser.username}</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم المعروض</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={selectedUser.role === 'super-admin'}
                                    >
                                        {ROLES.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        disabled={selectedUser.role === 'super-admin'}
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">معطل</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {PERMISSIONS.map(perm => (
                                        <label key={perm.value} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions?.includes(perm.value)}
                                                onChange={() => togglePermission(perm.value)}
                                                className="w-4 h-4"
                                            />
                                            <span>{perm.icon}</span>
                                            <span className="text-sm">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">حفظ التغييرات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">تغيير كلمة المرور</h2>
                                <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                            </div>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-gray-600">تغيير كلمة مرور المستخدم:</p>
                                <p className="font-bold text-lg">{selectedUser.displayName || selectedUser.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    dir="ltr"
                                    placeholder="كلمة مرور قوية"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
                                <button type="submit" className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">تغيير كلمة المرور</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
