/**
 * Family Tree Gateway Page
 * Main entry page with three navigation buttons to internal sections:
 * - Black: Founder Appreciation
 * - Red: Founder Discussions
 * - Green: Family Tree Display
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const FamilyTreeGateway = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredButton, setHoveredButton] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/family-tree-content/settings`);
            const data = await res.json();
            if (data.success && data.data) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Default settings if none fetched
    const defaultSettings = {
        gatewayTitle: 'شجرة عائلة الشاعر',
        gatewaySubtitle: 'اكتشف تاريخ وتراث عائلتنا العريقة',
        buttonLabels: {
            appreciation: 'تقدير ووفاء للمؤسس',
            discussions: 'حوارات مع المؤسس',
            tree: 'شجرة العائلة',
            devTeam: 'فريق التطوير'
        },
        buttonColors: {
            appreciation: '#1a1a1a',
            discussions: '#CE1126',
            tree: '#007A3D',
            devTeam: '#0d9488'
        }
    };

    const currentSettings = settings || defaultSettings;

    const buttons = [
        {
            id: 'appreciation',
            label: currentSettings.buttonLabels?.appreciation || defaultSettings.buttonLabels.appreciation,
            color: currentSettings.buttonColors?.appreciation || defaultSettings.buttonColors.appreciation,
            icon: '🏆',
            description: 'تعرف على تاريخ مؤسس شجرة العائلة وإرثه الخالد',
            path: '/family-tree/appreciation'
        },
        {
            id: 'discussions',
            label: currentSettings.buttonLabels?.discussions || defaultSettings.buttonLabels.discussions,
            color: currentSettings.buttonColors?.discussions || defaultSettings.buttonColors.discussions,
            icon: '💬',
            description: 'حوارات ومناقشات مع مؤسس العائلة',
            path: '/family-tree/discussions'
        },
        {
            id: 'tree',
            label: currentSettings.buttonLabels?.tree || defaultSettings.buttonLabels.tree,
            color: currentSettings.buttonColors?.tree || defaultSettings.buttonColors.tree,
            icon: '🌳',
            description: 'استكشف شجرة العائلة التفاعلية',
            path: '/family-tree/tree'
        },
        {
            id: 'lineage',
            label: 'شجرة الأنساب',
            color: '#2E7D32',
            icon: '🌿',
            description: 'شجرة أنساب العائلة الشاملة - أكثر من 3000 اسم',
            path: '/family-tree/lineage'
        },
        {
            id: 'devTeam',
            label: currentSettings.buttonLabels?.devTeam || defaultSettings.buttonLabels.devTeam,
            color: currentSettings.buttonColors?.devTeam || defaultSettings.buttonColors.devTeam,
            icon: '👨‍💻',
            description: 'تواصل مع فريق التطوير وشاركنا اقتراحاتك',
            path: '/family-tree/dev-team'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-palestine-green border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col rtl-content"
            dir="rtl"
            style={{
                background: currentSettings.gatewayBackground
                    ? `url(${currentSettings.gatewayBackground}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
            }}
        >
            {/* Overlay for background image */}
            {currentSettings.gatewayBackground && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            )}

            {/* Top Navigation */}
            <header className="relative z-10 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-700 hover:text-palestine-green transition-colors duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">العودة للرئيسية</span>
                    </Link>
                    <div className="text-2xl">🌳</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Title Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 drop-shadow-lg">
                        {currentSettings.gatewayTitle || defaultSettings.gatewayTitle}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {currentSettings.gatewaySubtitle || defaultSettings.gatewaySubtitle}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-palestine-green to-transparent rounded-full"></div>
                    </div>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
                    {buttons.map((button, index) => (
                        <button
                            key={button.id}
                            onClick={() => navigate(button.path)}
                            onMouseEnter={() => setHoveredButton(button.id)}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                            style={{
                                backgroundColor: button.color,
                                animationDelay: `${index * 150}ms`
                            }}
                        >
                            {/* Glowing Effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    boxShadow: `0 0 60px ${button.color}80, inset 0 0 60px ${button.color}30`
                                }}
                            ></div>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                                <div className="absolute -inset-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-10 text-center">
                                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    {button.icon}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                    {button.label}
                                </h2>
                                <p className="text-white/80 text-sm md:text-base leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
                                    {button.description}
                                </p>

                                {/* Arrow Icon */}
                                <div className="mt-6 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <svg className="w-8 h-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bottom Gradient */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `linear-gradient(90deg, transparent, white, transparent)`
                                }}
                            ></div>
                        </button>
                    ))}
                </div>

                {/* Decorative Elements */}
                <div className="mt-20 flex items-center gap-4 text-gray-400">
                    <div className="h-px w-16 bg-gray-300"></div>
                    <span className="text-sm">تراث العائلة</span>
                    <div className="h-px w-16 bg-gray-300"></div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} عائلة الشاعر - جميع الحقوق محفوظة
                </div>
            </footer>

            {/* Custom Styles */}
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
          animation: fade-in 0.8s ease-out forwards;
        }
        
        @keyframes shine {
          to {
            left: 200%;
          }
        }
        
        .group-hover\\:animate-shine:hover {
          animation: shine 1.5s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default FamilyTreeGateway;
