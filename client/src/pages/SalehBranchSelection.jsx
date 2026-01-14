import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SalehBranchSelection = () => {
    const navigate = useNavigate();
    const [hoveredButton, setHoveredButton] = useState(null);

    const buttons = [
        {
            id: 'saleh_ibrahim',
            label: 'إبراهيم',
            color: '#059669', // Emerald
            icon: '🌱',
            description: 'ذريته الدجاجنه والمقالده والعيده',
            path: '/family-tree/visual?branch=saleh_ibrahim'
        },
        {
            id: 'saleh_salman',
            label: 'سلمان',
            color: '#d97706', // Amber
            icon: '🌳',
            description: 'ذريته الزقامطه والمحامده والعوايضه والعرادات والقريدات والمهاوشه وابو مدلله',
            path: '/family-tree/tree/saleh/salman'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 rtl-content" dir="rtl">
            {/* Header */}
            <header className="relative z-10 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/family-tree/tree"
                            className="flex items-center gap-2 text-gray-700 hover:text-palestine-green transition-colors duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">العودة للفروع الرئيسية</span>
                        </Link>
                    </div>
                    <div className="text-2xl">🍂</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-lg">
                        فرع صالح
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        اختر أحد الفروع الرئيسية لعائلة صالح
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"></div>
                    </div>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    {buttons.map((button, index) => (
                        <button
                            key={button.id}
                            onClick={() => navigate(button.path)}
                            onMouseEnter={() => setHoveredButton(button.id)}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white"
                            style={{
                                animationDelay: `${index * 150}ms`
                            }}
                        >
                            {/* Color Header */}
                            <div className="h-40 flex items-center justify-center transition-colors duration-300"
                                style={{ backgroundColor: button.color }}>
                                <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
                                    {button.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 text-center bg-white relative z-10">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors">
                                    {button.label}
                                </h2>
                                <p className="text-gray-600 text-base leading-relaxed mb-6 font-medium">
                                    {button.description}
                                </p>

                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-6 h-6 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} عائلة الشاعر
                </div>
            </footer>
        </div>
    );
};

export default SalehBranchSelection;
