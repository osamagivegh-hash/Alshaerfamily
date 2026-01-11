/**
 * Founder Discussions Page
 * Section 2: Discussions and Dialogues with the Founder
 * Displays a list of interviews and discussions, with detail view
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

// Discussion Card Component
const DiscussionCard = ({ discussion, onClick }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <article
            onClick={onClick}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2"
        >
            {/* Cover Image */}
            <div className="relative h-56 overflow-hidden">
                {discussion.coverImage ? (
                    <img
                        src={discussion.coverImage}
                        alt={discussion.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                        <span className="text-6xl">💬</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Date Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    {formatDate(discussion.discussionDate)}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {discussion.title}
                </h3>

                {discussion.subtitle && (
                    <p className="text-gray-500 text-sm mb-3">{discussion.subtitle}</p>
                )}

                {discussion.summary && (
                    <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {discussion.summary}
                    </p>
                )}

                {/* Participants */}
                {discussion.participants && discussion.participants.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">المشاركون:</span>
                        <div className="flex -space-x-2 space-x-reverse">
                            {discussion.participants.slice(0, 3).map((p, idx) => (
                                <div
                                    key={idx}
                                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                                    title={p.name}
                                >
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        p.name.charAt(0)
                                    )}
                                </div>
                            ))}
                            {discussion.participants.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                                    +{discussion.participants.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {discussion.readingTime && (
                        <span className="text-sm text-gray-500">
                            📖 {discussion.readingTime} دقائق للقراءة
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-red-600 font-medium text-sm group-hover:gap-2 transition-all">
                        اقرأ المزيد
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </article>
    );
};

// Discussion Detail View
const DiscussionDetail = ({ discussion, onBack }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {/* Hero */}
            <div className="relative h-72 md:h-96">
                {discussion.coverImage ? (
                    <img
                        src={discussion.coverImage}
                        alt={discussion.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                        <span className="text-8xl">💬</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    رجوع للقائمة
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full mb-4">
                        <span>💬</span>
                        <span>حوار</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {discussion.title}
                    </h1>
                    {discussion.subtitle && (
                        <p className="text-xl text-white/80">{discussion.subtitle}</p>
                    )}
                </div>
            </div>

            {/* Meta Info */}
            <div className="bg-gray-50 border-b border-gray-100 px-8 py-6">
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>{formatDate(discussion.discussionDate)}</span>
                    </div>

                    {discussion.moderator && (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🎤</span>
                            <span>المحاور: {discussion.moderator}</span>
                        </div>
                    )}

                    {discussion.readingTime && (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📖</span>
                            <span>{discussion.readingTime} دقائق للقراءة</span>
                        </div>
                    )}
                </div>

                {/* Participants */}
                {discussion.participants && discussion.participants.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-medium text-gray-700 mb-3">المشاركون في الحوار:</p>
                        <div className="flex flex-wrap gap-4">
                            {discussion.participants.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-gray-600">{p.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{p.name}</p>
                                        {p.role && <p className="text-xs text-gray-500">{p.role}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
                <div
                    className="prose prose-lg prose-arabic max-w-none dialogue-text"
                    dangerouslySetInnerHTML={{ __html: discussion.content }}
                />
            </div>

            {/* Tags */}
            {discussion.tags && discussion.tags.length > 0 && (
                <div className="px-8 pb-8 flex flex-wrap gap-2">
                    {discussion.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Gallery */}
            {discussion.gallery && discussion.gallery.length > 0 && (
                <div className="px-8 pb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">معرض الصور</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {discussion.gallery.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`صورة ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

// Main Component
const FounderDiscussions = () => {
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchSingleDiscussion(id);
        } else {
            fetchDiscussions();
        }
    }, [id]);

    const fetchDiscussions = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${API_URL}/api/family-tree-content/discussions?page=${page}&limit=9`);
            const data = await res.json();

            if (data.success) {
                setDiscussions(data.data || []);
                setPagination({
                    page: data.pagination?.page || 1,
                    totalPages: data.pagination?.totalPages || 1
                });
            }
        } catch (err) {
            console.error('Error fetching discussions:', err);
            setError('خطأ في تحميل الحوارات');
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleDiscussion = async (discussionId) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/family-tree-content/discussions/${discussionId}`);
            const data = await res.json();

            if (data.success && data.data) {
                setSelectedDiscussion(data.data);
            } else {
                setError('الحوار غير موجود');
            }
        } catch (err) {
            console.error('Error fetching discussion:', err);
            setError('خطأ في تحميل الحوار');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscussionClick = (discussion) => {
        navigate(`/family-tree/discussions/${discussion.id || discussion._id}`);
        setSelectedDiscussion(discussion);
    };

    const handleBack = () => {
        navigate('/family-tree/discussions');
        setSelectedDiscussion(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 rtl-content" dir="rtl">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-red-200 hover:text-white transition-colors">
                                الرئيسية
                            </Link>
                            <span className="text-red-300">/</span>
                            <Link to="/family-tree" className="text-red-200 hover:text-white transition-colors">
                                شجرة العائلة
                            </Link>
                            <span className="text-red-300">/</span>
                            <span className="text-white font-medium">حوارات مع المؤسس</span>
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

            {/* Hero Section (for list view) */}
            {!selectedDiscussion && !id && (
                <section className="bg-gradient-to-r from-red-700 to-red-600 text-white pb-20 pt-12 text-center">
                    <div className="max-w-7xl mx-auto px-4">
                        <span className="text-5xl mb-6 block">💬</span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">حوارات مع مؤسس العائلة</h1>
                        <p className="text-xl text-red-100 max-w-2xl mx-auto">
                            مناقشات وحوارات مع مؤسس شجرة العائلة حول التاريخ والتراث والقيم
                        </p>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${!selectedDiscussion && !id ? '-mt-12' : ''}`}>
                {error && !discussions.length && !selectedDiscussion ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="text-6xl mb-6">📭</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'لا توجد حوارات'}</h2>
                        <p className="text-gray-600 mb-8">لم يتم إضافة حوارات بعد. ترقبوا المزيد قريباً.</p>
                        <Link
                            to="/family-tree"
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>العودة لشجرة العائلة</span>
                        </Link>
                    </div>
                ) : selectedDiscussion || id ? (
                    selectedDiscussion ? (
                        <DiscussionDetail discussion={selectedDiscussion} onBack={handleBack} />
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto"></div>
                        </div>
                    )
                ) : (
                    <>
                        {/* Discussions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {discussions.map((discussion) => (
                                <DiscussionCard
                                    key={discussion.id || discussion._id}
                                    discussion={discussion}
                                    onClick={() => handleDiscussionClick(discussion)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => fetchDiscussions(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.page === page
                                                ? 'bg-red-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-red-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-red-200">© {new Date().getFullYear()} عائلة الشاعر</p>
                        <div className="flex items-center gap-4">
                            <Link to="/family-tree/appreciation" className="text-red-200 hover:text-white transition-colors">
                                تقدير المؤسس
                            </Link>
                            <span className="text-red-400">|</span>
                            <Link to="/family-tree/tree" className="text-red-200 hover:text-white transition-colors">
                                شجرة العائلة
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default FounderDiscussions;
