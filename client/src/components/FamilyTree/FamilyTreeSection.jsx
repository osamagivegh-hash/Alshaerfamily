/**
 * Family Tree Section Component
 * Embeds the family tree visualization into the public home page
 */

import React, { useState, useEffect } from 'react';
import TreeVisualization from './TreeVisualization';
import PersonModal from './PersonModal';

const API_URL = import.meta.env.VITE_API_URL || '';

const FamilyTreeSection = () => {
    const [tree, setTree] = useState(null);
    const [stats, setStats] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchTreeData();
    }, []);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [treeRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/persons/tree`),
                fetch(`${API_URL}/api/persons/stats`)
            ]);

            const treeData = await treeRes.json();
            const statsData = await statsRes.json();

            if (treeData.success) {
                setTree(treeData.data);
            }
            if (statsData.success) {
                setStats(statsData.data);
            }
        } catch (err) {
            console.error('Error fetching tree data:', err);
            setError('خطأ في تحميل شجرة العائلة');
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

    const zoomIn = () => setZoom(prev => Math.min(2, prev + 0.1));
    const zoomOut = () => setZoom(prev => Math.max(0.3, prev - 0.1));
    const resetZoom = () => setZoom(1);

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="family-tree">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="family-tree">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center text-gray-500">
                        <p>{error}</p>
                        <button
                            onClick={fetchTreeData}
                            className="mt-4 px-4 py-2 bg-palestine-green text-white rounded-lg hover:bg-opacity-90"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (!tree) {
        return (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="family-tree">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-palestine-black mb-4">
                        🌳 شجرة العائلة
                    </h2>
                    <p className="text-gray-500">لم يتم إضافة شجرة العائلة بعد</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50" id="family-tree">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-palestine-black mb-4">
                        🌳 شجرة العائلة
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        تعرف على أفراد عائلة الشاعر عبر الأجيال المختلفة
                    </p>

                    {/* Statistics */}
                    {stats && (
                        <div className="flex flex-wrap justify-center gap-6 mt-6">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                                <span className="text-2xl">👥</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-palestine-green">{stats.totalPersons}</p>
                                    <p className="text-xs text-gray-500">فرد</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                                <span className="text-2xl">📊</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-palestine-green">{stats.totalGenerations}</p>
                                    <p className="text-xs text-gray-500">جيل</p>
                                </div>
                            </div>
                            {stats.genderStats?.male && (
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                                    <span className="text-2xl">👨</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">{stats.genderStats.male}</p>
                                        <p className="text-xs text-gray-500">ذكور</p>
                                    </div>
                                </div>
                            )}
                            {stats.genderStats?.female && (
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                                    <span className="text-2xl">👩</span>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-pink-600">{stats.genderStats.female}</p>
                                        <p className="text-xs text-gray-500">إناث</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Zoom Controls */}
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={zoomOut}
                        className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        title="تصغير"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <button
                        onClick={resetZoom}
                        className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <button
                        onClick={zoomIn}
                        className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        title="تكبير"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 bg-palestine-green text-white rounded-lg shadow hover:bg-opacity-90 transition-colors"
                        title={isExpanded ? 'تصغير' : 'ملء الشاشة'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isExpanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Tree Visualization */}
                <div className={`border rounded-2xl overflow-hidden shadow-lg bg-white ${isExpanded ? 'fixed inset-4 z-40' : ''}`}>
                    {isExpanded && (
                        <div className="absolute top-4 left-4 z-50">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <TreeVisualization
                        data={tree}
                        onNodeClick={handleNodeClick}
                        zoom={zoom}
                    />
                </div>

                {/* Instructions */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>اضغط على أي اسم لعرض التفاصيل • استخدم أزرار التكبير للتنقل</p>
                </div>

                {/* Person Modal */}
                {selectedPerson && (
                    <PersonModal
                        person={selectedPerson}
                        onClose={() => setSelectedPerson(null)}
                    />
                )}
            </div>
        </section>
    );
};

export default FamilyTreeSection;
