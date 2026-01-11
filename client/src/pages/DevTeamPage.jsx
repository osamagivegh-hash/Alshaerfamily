/**
 * Development Team Page
 * Contact form and posts from the development team
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

// Message Categories
const CATEGORIES = [
    { value: 'suggestion', label: 'اقتراح', icon: '💡' },
    { value: 'bug', label: 'مشكلة تقنية', icon: '🐛' },
    { value: 'question', label: 'استفسار', icon: '❓' },
    { value: 'feedback', label: 'ملاحظات', icon: '📣' },
    { value: 'other', label: 'أخرى', icon: '📝' }
];

// Post Component
const PostCard = ({ post }) => {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPostTypeStyle = (type) => {
        switch (type) {
            case 'announcement': return 'bg-red-100 text-red-700';
            case 'update': return 'bg-blue-100 text-blue-700';
            case 'feature': return 'bg-green-100 text-green-700';
            case 'maintenance': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPostTypeLabel = (type) => {
        switch (type) {
            case 'announcement': return 'إعلان';
            case 'update': return 'تحديث';
            case 'feature': return 'ميزة جديدة';
            case 'maintenance': return 'صيانة';
            default: return 'عام';
        }
    };

    return (
        <article className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${post.isPinned ? 'ring-2 ring-teal-500' : ''}`}>
            <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{post.icon || '📢'}</span>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {post.isPinned && (
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">📌 مثبت</span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPostTypeStyle(post.postType)}`}>
                                    {getPostTypeLabel(post.postType)}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(post.createdAt)}
                    </span>
                </div>

                {post.summary && !expanded && (
                    <p className="text-gray-600 mb-4">{post.summary}</p>
                )}

                {expanded && (
                    <div
                        className="prose prose-sm max-w-none text-gray-700 mb-4"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                )}

                {post.content && post.content.length > 200 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                        {expanded ? 'عرض أقل ▲' : 'عرض المزيد ▼'}
                    </button>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                    بواسطة: {post.author}
                </div>
            </div>
        </article>
    );
};

// Contact Form Component
const ContactForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        subject: '',
        message: '',
        category: 'other'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/dev-team/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setFormData({
                    senderName: '',
                    senderEmail: '',
                    senderPhone: '',
                    subject: '',
                    message: '',
                    category: 'other'
                });
                if (onSuccess) onSuccess();
            } else {
                setError(data.message || 'حدث خطأ في إرسال الرسالة');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">تم إرسال رسالتك بنجاح!</h3>
                <p className="text-green-700 mb-6">سيتواصل معك فريق التطوير في أقرب وقت ممكن.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    إرسال رسالة أخرى
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="أدخل اسمك الكامل"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="senderEmail"
                        value={formData.senderEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="example@email.com"
                        dir="ltr"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف (اختياري)
                    </label>
                    <input
                        type="tel"
                        name="senderPhone"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        placeholder="+966..."
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الرسالة
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموضوع <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="موضوع رسالتك"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-y"
                    placeholder="اكتب رسالتك هنا..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold rounded-lg hover:from-teal-700 hover:to-teal-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                        <span>جاري الإرسال...</span>
                    </>
                ) : (
                    <>
                        <span>📤</span>
                        <span>إرسال الرسالة</span>
                    </>
                )}
            </button>
        </form>
    );
};

// Main Component
const DevTeamPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contact');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/dev-team/posts`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-100 rtl-content" dir="rtl">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-teal-200 hover:text-white transition-colors">
                                الرئيسية
                            </Link>
                            <span className="text-teal-300">/</span>
                            <Link to="/family-tree" className="text-teal-200 hover:text-white transition-colors">
                                شجرة العائلة
                            </Link>
                            <span className="text-teal-300">/</span>
                            <span className="text-white font-medium">فريق التطوير</span>
                        </nav>

                        {/* Back Button */}
                        <Link
                            to="/family-tree"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>رجوع</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-teal-700 to-teal-600 text-white pb-20 pt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <span className="text-5xl mb-6 block">👨‍💻</span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">فريق التطوير</h1>
                    <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                        تواصل معنا لمشاركة اقتراحاتك أو الإبلاغ عن مشكلة أو طرح أي استفسار
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'contact'
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <span>✉️</span>
                        <span>تواصل معنا</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'posts'
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <span>📢</span>
                        <span>منشورات الفريق</span>
                        {posts.length > 0 && (
                            <span className="bg-teal-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {posts.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {activeTab === 'contact' ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">أرسل لنا رسالة</h2>
                            <p className="text-gray-600">نحن هنا للاستماع إليك والرد على استفساراتك</p>
                        </div>
                        <ContactForm />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-gray-600">جاري التحميل...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <div className="text-6xl mb-6">📭</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منشورات</h3>
                                <p className="text-gray-600">سيتم نشر التحديثات والإعلانات هنا قريباً</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post.id || post._id} post={post} />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-teal-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-teal-200">© {new Date().getFullYear()} عائلة الشاعر - فريق التطوير</p>
                        <div className="flex items-center gap-4 text-sm">
                            <Link to="/family-tree/appreciation" className="text-teal-200 hover:text-white transition-colors">
                                تقدير المؤسس
                            </Link>
                            <span className="text-teal-400">|</span>
                            <Link to="/family-tree/tree" className="text-teal-200 hover:text-white transition-colors">
                                شجرة العائلة
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DevTeamPage;
