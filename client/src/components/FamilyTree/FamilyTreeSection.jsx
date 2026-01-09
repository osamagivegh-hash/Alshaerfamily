/**
 * Family Tree Section Component
 * Call to Action for the family tree page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const FamilyTreeSection = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/persons/stats`);
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching tree stats:', err);
        }
    };

    return (
        <section className="py-20 bg-gradient-to-b from-white to-green-50" id="family-tree">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="mb-8">
                    <span className="inline-block p-3 bg-green-100 rounded-full mb-4">
                        <span className="text-4xl">🌳</span>
                    </span>
                    <h2 className="text-4xl font-bold text-palestine-black mb-6">
                        شجرة العائلة
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        اكتشف تاريخ ونسب عائلة الشاعر العريقة. تصفح شجرة العائلة التفاعلية، وتعرف على الأجداد والأحفاد، وتواصل مع جذورك.
                    </p>
                </div>

                {stats && (
                    <div className="flex flex-wrap justify-center gap-8 mb-10">
                        <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-green-100 transform hover:scale-105 transition-transform duration-300">
                            <p className="text-4xl font-bold text-palestine-green mb-1">{stats.totalPersons}</p>
                            <p className="text-gray-500 font-medium">فرد في العائلة</p>
                        </div>
                        <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-green-100 transform hover:scale-105 transition-transform duration-300">
                            <p className="text-4xl font-bold text-palestine-green mb-1">{stats.totalGenerations}</p>
                            <p className="text-gray-500 font-medium">جيل موثق</p>
                        </div>
                    </div>
                )}

                <div>
                    <Link
                        to="/family-tree"
                        className="inline-flex items-center gap-3 bg-palestine-black text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-palestine-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <span>تصفح شجرة العائلة</span>
                        <svg className="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FamilyTreeSection;
