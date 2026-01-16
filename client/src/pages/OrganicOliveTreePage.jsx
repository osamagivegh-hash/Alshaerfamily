/**
 * صفحة شجرة الزيتون العضوية
 * Organic Olive Tree Page
 * عرض شجرة الزيتون التفاعلية بالتصميم الفني المتقدم
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganicOliveTree from '../components/FamilyTree/OrganicOliveTree';
import { PersonModal } from '../components/FamilyTree';

const API_URL = import.meta.env.VITE_API_URL || '';

const OrganicOliveTreePage = () => {
    const [tree, setTree] = useState(null);
    const [stats, setStats] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [treeRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/persons/tree`),
                fetch(`${API_URL}/api/persons/stats`)
            ]);

            const [treeData, statsData] = await Promise.all([
                treeRes.json(),
                statsRes.json()
            ]);

            if (treeData.success) setTree(treeData.data);
            if (statsData.success) setStats(statsData.data);

        } catch (err) {
            console.error('Error fetching tree data:', err);
            setError('خطأ في تحميل شجرة الأنساب');
        } finally {
            setLoading(false);
        }
    };

    const handleNodeClick = async (node) => {
        if (!node._id) return;

        try {
            const res = await fetch(`${API_URL}/api/persons/${node._id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedPerson(data.data);
            }
        } catch (err) {
            console.error('Error fetching person details:', err);
        }
    };

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: 'linear-gradient(180deg, #FFFFF8 0%, #F5F5DC 50%, #FFFFF8 100%)'
                }}
            >
                <div className="text-center">
                    {/* Animated olive tree loader */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        {/* Trunk */}
                        <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-16 rounded-t-lg"
                            style={{ backgroundColor: '#5D4037' }}
                        ></div>
                        {/* Canopy */}
                        <div
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full animate-pulse"
                            style={{ backgroundColor: '#2E7D32' }}
                        >
                            {/* Spinning leaves */}
                            <div className="absolute inset-2 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-3 h-2 rounded-full"
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${angle}deg) translateX(30px) translateY(-50%)`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p
                        className="text-lg font-semibold mb-2"
                        style={{ color: '#2E7D32', fontFamily: "'Cairo', sans-serif" }}
                    >
                        جاري زراعة شجرة الزيتون...
                    </p>
                    <p className="text-sm text-gray-500">
                        الرجاء الانتظار بينما نُحضّر الشجرة
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col rtl-content"
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)'
                }}
            >
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-white/80">
                            <Link to="/" className="hover:text-white transition-colors">
                                الرئيسية
                            </Link>
                            <span className="text-white/40">/</span>
                            <Link to="/family-tree" className="hover:text-white transition-colors">
                                شجرة العائلة
                            </Link>
                            <span className="text-white/40">/</span>
                            <span className="text-white font-medium">شجرة الزيتون</span>
                        </nav>

                        {/* Stats & Back */}
                        <div className="flex items-center gap-4">
                            {stats && (
                                <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-full px-5 py-1.5 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-lg">🌿</span>
                                        <span className="font-bold text-white">{stats.totalPersons}</span>
                                        <span className="text-white/70">فرد</span>
                                    </span>
                                    <span className="w-px h-4 bg-white/20"></span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-lg">📊</span>
                                        <span className="font-bold text-white">{stats.generationsCount || 6}</span>
                                        <span className="text-white/70">أجيال</span>
                                    </span>
                                </div>
                            )}

                            <Link
                                to="/family-tree"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 
                                           px-4 py-2 rounded-lg transition-all text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="hidden sm:inline">العودة</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative" style={{ minHeight: '85vh' }}>
                {error ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                            <div className="text-6xl mb-4">🌱</div>
                            <h3 className="text-xl font-bold text-red-600 mb-3">{error}</h3>
                            <p className="text-gray-500 mb-6">
                                حدث خطأ أثناء تحميل بيانات شجرة العائلة
                            </p>
                            <button
                                onClick={fetchData}
                                className="bg-green-600 text-white px-8 py-3 rounded-xl 
                                           hover:bg-green-700 transition-colors font-medium
                                           shadow-lg hover:shadow-xl"
                            >
                                🔄 إعادة المحاولة
                            </button>
                        </div>
                    </div>
                ) : tree ? (
                    <OrganicOliveTree
                        data={tree}
                        onNodeClick={handleNodeClick}
                        style={{ height: '100%', minHeight: '85vh' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <div className="text-6xl mb-4">🌳</div>
                            <p className="text-gray-600 font-medium text-lg">
                                لا توجد بيانات متاحة لعرض الشجرة
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Person Modal */}
            {selectedPerson && (
                <PersonModal
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                />
            )}
        </div>
    );
};

export default OrganicOliveTreePage;
