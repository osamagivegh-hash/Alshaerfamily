/**
 * صفحة شجرة الزيتون العضوية - Nano Banana Style
 * Organic Olive Tree Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganicOliveTree from '../components/FamilyTree/OrganicOliveTree';

const API_URL = import.meta.env.VITE_API_URL || '';

const OrganicOliveTreePage = () => {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/persons/tree`);
            const data = await res.json();
            if (data.success) {
                setTree(data.data);
            } else {
                setError('فشل تحميل البيانات');
            }
        } catch (err) {
            console.error(err);
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F0]">
                <div className="w-16 h-16 border-4 border-[#558B2F] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#5D4037] font-bold text-lg">جاري رسم شجرة العائلة...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9F0]">
                <div className="text-center p-8 bg-white shadow-xl rounded-xl border border-red-200">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-red-600 mb-2">{error}</h3>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-6 py-2 bg-[#558B2F] text-white rounded-lg hover:bg-[#33691E] transition"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden flex flex-col bg-[#F9F9F0]">
            {/* Minimal Header */}
            <div className="bg-[#558B2F] text-white px-4 py-2 shadow-md flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <Link to="/family-tree" className="hover:bg-white/20 p-2 rounded-full transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <span className="font-bold">شجرة العائلة الرقمية</span>
                </div>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    نمط Nano Banana
                </div>
            </div>

            {/* Tree Container - Full Height */}
            <div className="flex-1 relative overflow-hidden">
                <OrganicOliveTree
                    data={tree}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default OrganicOliveTreePage;
