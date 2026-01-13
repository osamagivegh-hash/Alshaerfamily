/**
 * Artistic Tree Page
 * Displays the "Natural" bottom-up family tree
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NaturalTreeVisualization, PersonModal } from '../components/FamilyTree';

const API_URL = import.meta.env.VITE_API_URL || '';

const ArtisticTreePage = () => {
    const [tree, setTree] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(0.8);

    useEffect(() => {
        fetchTreeData();
    }, []);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/persons/tree`);
            const data = await res.json();

            if (data.success) {
                setTree(data.data);
            } else {
                setError('فشل في تحميل بيانات الشجرة');
            }
        } catch (err) {
            console.error('Error fetching tree:', err);
            setError('خطأ في الاتصال بالخادم');
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
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-palestine-green border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#e0f7fa] rtl-content" dir="rtl">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/family-tree/tree" className="text-gray-600 hover:text-palestine-green font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            العودة للاختيارات
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">الشجرة الفنية</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {error ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white p-8 rounded shadow text-red-600">{error}</div>
                    </div>
                ) : (
                    <div className="flex-1 w-full h-full p-4">
                        <div className="relative w-full h-full border-4 border-[#8D6E63] rounded-xl overflow-hidden shadow-2xl bg-white">
                            <NaturalTreeVisualization
                                data={tree}
                                onNodeClick={handleNodeClick}
                                zoom={zoom}
                                className="h-full"
                            />

                            {/* Zoom Controls Overlay */}
                            <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-lg">
                                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-gray-100 rounded">+</button>
                                <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 hover:bg-gray-100 rounded">-</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedPerson && (
                <PersonModal person={selectedPerson} onClose={() => setSelectedPerson(null)} />
            )}
        </div>
    );
};

export default ArtisticTreePage;
