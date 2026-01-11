/**
 * Admin Development Team Messages Management
 * View, respond to, and manage messages from users
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';
import adminApi from '../../utils/adminApi';

const API_URL = import.meta.env.VITE_API_URL || '';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        new: 'bg-red-100 text-red-700',
        read: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-green-100 text-green-700',
        archived: 'bg-gray-100 text-gray-600'
    };

    const labels = {
        new: 'جديد',
        read: 'مقروء',
        in_progress: 'قيد المعالجة',
        resolved: 'تم الحل',
        archived: 'مؤرشف'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
            {labels[status] || status}
        </span>
    );
};

// Category Badge Component
const CategoryBadge = ({ category }) => {
    const icons = {
        suggestion: '💡',
        bug: '🐛',
        question: '❓',
        feedback: '📣',
        other: '📝'
    };

    const labels = {
        suggestion: 'اقتراح',
        bug: 'مشكلة تقنية',
        question: 'استفسار',
        feedback: 'ملاحظات',
        other: 'أخرى'
    };

    return (
        <span className="text-sm text-gray-600">
            {icons[category] || icons.other} {labels[category] || category}
        </span>
    );
};

// Message Detail Modal
const MessageDetailModal = ({ message, onClose, onUpdate }) => {
    const [response, setResponse] = useState(message.response || '');
    const [status, setStatus] = useState(message.status);
    const [priority, setPriority] = useState(message.priority || 'medium');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/dev-team/admin/messages/${message.id || message._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ status, response, priority })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('تم تحديث الرسالة بنجاح');
                onUpdate(data.data);
                onClose();
            } else {
                toast.error(data.message || 'خطأ في التحديث');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">{message.subject}</h2>
                            <div className="flex items-center gap-3 text-sm text-teal-100">
                                <span>من: {message.senderName}</span>
                                <span>•</span>
                                <CategoryBadge category={message.category} />
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Sender Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 mb-3">معلومات المرسل</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">الاسم:</span>
                                <span className="mr-2 font-medium">{message.senderName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">البريد:</span>
                                <a href={`mailto:${message.senderEmail}`} className="mr-2 text-teal-600 hover:underline">
                                    {message.senderEmail}
                                </a>
                            </div>
                            {message.senderPhone && (
                                <div>
                                    <span className="text-gray-500">الهاتف:</span>
                                    <span className="mr-2">{message.senderPhone}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500">التاريخ:</span>
                                <span className="mr-2">{formatDate(message.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">الرسالة</h3>
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                            {message.message}
                        </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="new">جديد</option>
                                <option value="read">مقروء</option>
                                <option value="in_progress">قيد المعالجة</option>
                                <option value="resolved">تم الحل</option>
                                <option value="archived">مؤرشف</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="low">منخفضة</option>
                                <option value="medium">متوسطة</option>
                                <option value="high">عالية</option>
                                <option value="urgent">عاجلة</option>
                            </select>
                        </div>
                    </div>

                    {/* Response */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الرد (اختياري)</label>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-y"
                            placeholder="اكتب ردك هنا..."
                        />
                        {message.respondedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                                آخر رد بواسطة {message.respondedBy} في {formatDate(message.respondedAt)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
    );
};

// Post Form Modal
const PostFormModal = ({ post, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: post?.title || '',
        content: post?.content || '',
        summary: post?.summary || '',
        postType: post?.postType || 'general',
        icon: post?.icon || '📢',
        isPublished: post?.isPublished ?? true,
        isPinned: post?.isPinned || false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = post
                ? `${API_URL}/api/dev-team/admin/posts/${post.id || post._id}`
                : `${API_URL}/api/dev-team/admin/posts`;

            const res = await fetch(url, {
                method: post ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                toast.success(post ? 'تم تحديث المنشور' : 'تم إنشاء المنشور');
                onSave(data.data);
                onClose();
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {post ? 'تعديل المنشور' : 'إنشاء منشور جديد'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المنشور</label>
                            <select
                                value={formData.postType}
                                onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="general">عام</option>
                                <option value="announcement">إعلان</option>
                                <option value="update">تحديث</option>
                                <option value="feature">ميزة جديدة</option>
                                <option value="maintenance">صيانة</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-2xl text-center"
                                style={{ width: '80px' }}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">ملخص</label>
                            <input
                                type="text"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="ملخص قصير للمنشور..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-y"
                            />
                        </div>

                        <div className="col-span-2 flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded text-teal-600"
                                />
                                <span>نشر المنشور</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPinned}
                                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                    className="w-5 h-5 rounded text-teal-600"
                                />
                                <span>تثبيت في الأعلى</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                            {saving ? 'جاري الحفظ...' : (post ? 'تحديث' : 'إنشاء')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Component
const AdminDevTeamMessages = () => {
    const [activeTab, setActiveTab] = useState('messages');
    const [messages, setMessages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [filter, setFilter] = useState({ status: '', category: '' });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchMessages(), fetchPosts(), fetchStats()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            let url = `${API_URL}/api/dev-team/admin/messages?`;
            if (filter.status) url += `status=${filter.status}&`;
            if (filter.category) url += `category=${filter.category}&`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/dev-team/admin/posts`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                setPosts(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/dev-team/admin/messages/stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const deleteMessage = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

        try {
            const res = await fetch(`${API_URL}/api/dev-team/admin/messages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم حذف الرسالة');
                fetchMessages();
                fetchStats();
            }
        } catch (error) {
            toast.error('خطأ في الحذف');
        }
    };

    const deletePost = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;

        try {
            const res = await fetch(`${API_URL}/api/dev-team/admin/posts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم حذف المنشور');
                fetchPosts();
            }
        } catch (error) {
            toast.error('خطأ في الحذف');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">👨‍💻 رسائل فريق التطوير</h1>
                <p className="text-teal-100">إدارة الرسائل الواردة ومنشورات الفريق</p>

                {stats && (
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-teal-100">جديد:</span>
                            <span className="mr-2 font-bold">{stats.new}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-teal-100">قيد المعالجة:</span>
                            <span className="mr-2 font-bold">{stats.inProgress}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-teal-100">تم الحل:</span>
                            <span className="mr-2 font-bold">{stats.resolved}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-teal-100">الإجمالي:</span>
                            <span className="mr-2 font-bold">{stats.total}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'messages'
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <span>✉️</span>
                    <span>الرسائل</span>
                    {stats?.new > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.new}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'posts'
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <span>📢</span>
                    <span>المنشورات</span>
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {activeTab === 'messages' ? (
                    <>
                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="new">جديد</option>
                                <option value="read">مقروء</option>
                                <option value="in_progress">قيد المعالجة</option>
                                <option value="resolved">تم الحل</option>
                                <option value="archived">مؤرشف</option>
                            </select>
                            <select
                                value={filter.category}
                                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">جميع الأنواع</option>
                                <option value="suggestion">اقتراح</option>
                                <option value="bug">مشكلة تقنية</option>
                                <option value="question">استفسار</option>
                                <option value="feedback">ملاحظات</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>

                        {/* Messages List */}
                        {messages.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-5xl mb-4">📭</div>
                                <p>لا توجد رسائل</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id || msg._id}
                                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${msg.status === 'new' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                                            }`}
                                        onClick={() => setSelectedMessage(msg)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <StatusBadge status={msg.status} />
                                                    <CategoryBadge category={msg.category} />
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">{msg.subject}</h3>
                                                <p className="text-sm text-gray-600">
                                                    من: {msg.senderName} ({msg.senderEmail})
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(msg.createdAt)}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMessage(msg.id || msg._id);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Posts Tab */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800">منشورات الفريق</h2>
                            <button
                                onClick={() => {
                                    setEditingPost(null);
                                    setShowPostForm(true);
                                }}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>منشور جديد</span>
                            </button>
                        </div>

                        {posts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-5xl mb-4">📝</div>
                                <p>لا توجد منشورات</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <div
                                        key={post.id || post._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">{post.icon}</span>
                                                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                                                    {post.isPinned && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">📌 مثبت</span>}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {post.isPublished ? 'منشور' : 'مسودة'}
                                                    </span>
                                                </div>
                                                {post.summary && <p className="text-sm text-gray-600">{post.summary}</p>}
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(post.createdAt)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingPost(post);
                                                        setShowPostForm(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => deletePost(post.id || post._id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                    onUpdate={(updated) => {
                        setMessages(messages.map(m => (m.id || m._id) === (updated.id || updated._id) ? updated : m));
                        fetchStats();
                    }}
                />
            )}

            {showPostForm && (
                <PostFormModal
                    post={editingPost}
                    onClose={() => {
                        setShowPostForm(false);
                        setEditingPost(null);
                    }}
                    onSave={() => fetchPosts()}
                />
            )}
        </div>
    );
};

export default AdminDevTeamMessages;
