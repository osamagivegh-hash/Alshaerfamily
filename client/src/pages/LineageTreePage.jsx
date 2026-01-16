/**
 * صفحة شجرة الأنساب
 * Lineage Tree Page
 * عرض شجرة الأنساب التفاعلية بالتصميم الجديد
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineageTreeVisualization, PersonModal } from '../components/FamilyTree';

const API_URL = import.meta.env.VITE_API_URL || '';

const LineageTreePage = () => {
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] to-[#FFFFF8]">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
                        <div className="absolute inset-4 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-3xl">🌳</span>
                        </div>
                    </div>
                    <p className="text-green-800 font-semibold text-lg">جاري تحميل شجرة الأنساب...</p>
                    <p className="text-green-600 text-sm mt-2">الرجاء الانتظار</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F5F5DC] rtl-content" dir="rtl">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-xl sticky top-0 z-50">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb & Title */}
                        <div className="flex items-center gap-6">
                            <nav className="flex items-center gap-2 text-sm">
                                <Link to="/" className="text-green-200 hover:text-white transition-colors">
                                    الرئيسية
                                </Link>
                                <span className="text-green-400">/</span>
                                <Link to="/family-tree" className="text-green-200 hover:text-white transition-colors">
                                    شجرة العائلة
                                </Link>
                                <span className="text-green-400">/</span>
                                <span className="text-white font-medium">شجرة الأنساب</span>
                            </nav>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                            {stats && (
                                <div className="hidden md:flex gap-4 text-sm bg-white/10 rounded-full px-6 py-2">
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">🌿</span>
                                        <span className="font-semibold">{stats.totalPersons}</span>
                                        <span className="text-green-200">فرد</span>
                                    </span>
                                    {stats.generationsCount && (
                                        <span className="flex items-center gap-2 border-r border-white/20 pr-4">
                                            <span className="text-lg">📊</span>
                                            <span className="font-semibold">{stats.generationsCount}</span>
                                            <span className="text-green-200">جيل</span>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Back Button */}
                            <Link
                                to="/family-tree"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>العودة</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Tree Area */}
            <main className="flex-1 relative overflow-hidden" style={{ minHeight: '85vh' }}>
                {error ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">{error}</h3>
                            <p className="text-gray-500 mb-4">حدث خطأ أثناء تحميل البيانات</p>
                            <button
                                onClick={fetchData}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                ) : tree ? (
                    <LineageTreeVisualization
                        data={tree}
                        onNodeClick={handleNodeClick}
                        style={{ height: '100%', minHeight: '85vh' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            <div className="text-5xl mb-4">🌱</div>
                            <p className="text-gray-600 font-medium">لا توجد بيانات متاحة</p>
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

export default LineageTreePage;
