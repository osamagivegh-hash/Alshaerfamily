/**
 * Mobile Section Content Components
 * ==================================
 * Individual content sections optimized for mobile single-screen layout.
 * Each section is designed to fit within the viewport with minimal scrolling.
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionsData } from '../../utils/api';

// Lazy load heavy components
const News = lazy(() => import('../../components/News'));
const Articles = lazy(() => import('../../components/Articles'));
const Conversations = lazy(() => import('../../components/Conversations'));
const Palestine = lazy(() => import('../../components/Palestine'));
const Gallery = lazy(() => import('../../components/Gallery'));
const Contact = lazy(() => import('../../components/Contact'));

// Loading spinner for sections
const SectionLoader = () => (
    <div className="mobile-section-loader">
        <div className="loader-spinner"></div>
        <p>جاري التحميل...</p>
    </div>
);

// ==================== HOME SECTION ====================
export const MobileHomeSection = ({ data }) => {
    const navigate = useNavigate();

    // Quick action cards for home screen
    const quickActions = [
        {
            id: 'family-tree',
            label: 'شجرة العائلة',
            description: 'استكشف شجرة عائلة الشاعر',
            icon: '🌳',
            gradient: 'from-green-600 to-green-800',
            action: () => navigate('/family-tree')
        },
        {
            id: 'news',
            label: 'آخر الأخبار',
            description: 'اطلع على أحدث الأخبار',
            icon: '📰',
            gradient: 'from-gray-700 to-gray-900'
        },
        {
            id: 'articles',
            label: 'المقالات',
            description: 'اقرأ أحدث المقالات',
            icon: '📖',
            gradient: 'from-emerald-600 to-teal-700'
        },
        {
            id: 'gallery',
            label: 'معرض الصور',
            description: 'تصفح معرض الصور',
            icon: '🖼️',
            gradient: 'from-purple-600 to-indigo-700'
        }
    ];

    return (
        <div className="mobile-section mobile-home-section">
            {/* Hero Welcome */}
            <div className="mobile-hero">
                <div className="mobile-hero-content">
                    <h1 className="mobile-hero-title">
                        أهلاً بكم في موقع
                        <br />
                        <span className="highlight">عائلة الشاعر</span>
                    </h1>
                    <p className="mobile-hero-subtitle">
                        المنصة الرقمية لشجرة عائلة الشاعر الإلكترونية
                    </p>
                </div>

                {/* Decorative olive tree */}
                <div className="mobile-hero-decoration">
                    <div className="olive-tree-simple">🫒</div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mobile-quick-actions">
                <h2 className="quick-actions-title">الوصول السريع</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className={`quick-action-card bg-gradient-to-br ${action.gradient}`}
                            onClick={action.action}
                        >
                            <span className="quick-action-icon">{action.icon}</span>
                            <span className="quick-action-label">{action.label}</span>
                            <span className="quick-action-desc">{action.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Country Flags */}
            <div className="mobile-flags-section">
                <div className="flags-row">
                    <div className="flag-item">
                        <img src="https://flagcdn.com/w40/ps.png" alt="فلسطين" />
                        <span>فلسطين</span>
                    </div>
                    <div className="flag-item">
                        <img src="https://flagcdn.com/w40/eg.png" alt="مصر" />
                        <span>مصر</span>
                    </div>
                    <div className="flag-item">
                        <img src="https://flagcdn.com/w40/jo.png" alt="الأردن" />
                        <span>الأردن</span>
                    </div>
                    <div className="flag-item">
                        <img src="https://flagcdn.com/w40/sa.png" alt="السعودية" />
                        <span>السعودية</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== FAMILY TREE SECTION ====================
export const MobileFamilyTreeSection = () => {
    const navigate = useNavigate();

    const treeOptions = [
        {
            id: 'visual',
            label: 'الشجرة المرئية',
            description: 'عرض تفاعلي لشجرة العائلة',
            icon: '🌳',
            gradient: 'from-green-600 to-emerald-700',
            path: '/family-tree/visual'
        },
        {
            id: 'organic',
            label: 'شجرة الزيتون',
            description: 'تصميم فني لشجرة الزيتون',
            icon: '🫒',
            gradient: 'from-olive-600 to-green-800',
            path: '/family-tree/organic-olive'
        },
        {
            id: 'appreciation',
            label: 'تقدير المؤسسين',
            description: 'صفحة تقدير المؤسسين',
            icon: '🏆',
            gradient: 'from-amber-500 to-orange-600',
            path: '/family-tree/appreciation'
        },
        {
            id: 'discussions',
            label: 'حوارات العائلة',
            description: 'المناقشات والحوارات',
            icon: '💬',
            gradient: 'from-blue-600 to-indigo-700',
            path: '/family-tree/discussions'
        }
    ];

    return (
        <div className="mobile-section mobile-family-tree-section">
            <div className="section-header">
                <h2 className="section-title">شجرة العائلة</h2>
                <p className="section-subtitle">استكشف شجرة عائلة الشاعر بطرق مختلفة</p>
            </div>

            <div className="tree-options-grid">
                {treeOptions.map((option) => (
                    <button
                        key={option.id}
                        className={`tree-option-card bg-gradient-to-br ${option.gradient}`}
                        onClick={() => navigate(option.path)}
                    >
                        <span className="option-icon">{option.icon}</span>
                        <div className="option-content">
                            <span className="option-label">{option.label}</span>
                            <span className="option-desc">{option.description}</span>
                        </div>
                        <svg className="option-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                ))}
            </div>

            {/* Branch Selection Quick Access */}
            <div className="branch-quick-access">
                <h3>الفروع الرئيسية</h3>
                <div className="branches-grid">
                    <button
                        className="branch-card zahar"
                        onClick={() => navigate('/family-tree/tree/zahar')}
                    >
                        <span className="branch-name">فرع زاهر</span>
                    </button>
                    <button
                        className="branch-card saleh"
                        onClick={() => navigate('/family-tree/tree/saleh')}
                    >
                        <span className="branch-name">فرع صالح</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== NEWS SECTION ====================
export const MobileNewsSection = ({ data }) => {
    return (
        <div className="mobile-section mobile-news-section">
            <Suspense fallback={<SectionLoader />}>
                <News data={data} />
            </Suspense>
        </div>
    );
};

// ==================== ARTICLES SECTION ====================
export const MobileArticlesSection = ({ data }) => {
    return (
        <div className="mobile-section mobile-articles-section">
            <Suspense fallback={<SectionLoader />}>
                <Articles data={data} />
            </Suspense>
        </div>
    );
};

// ==================== CONVERSATIONS SECTION ====================
export const MobileConversationsSection = ({ data }) => {
    return (
        <div className="mobile-section mobile-conversations-section">
            <Suspense fallback={<SectionLoader />}>
                <Conversations data={data} />
            </Suspense>
        </div>
    );
};

// ==================== PALESTINE SECTION ====================
export const MobilePalestineSection = ({ data }) => {
    return (
        <div className="mobile-section mobile-palestine-section">
            <Suspense fallback={<SectionLoader />}>
                <Palestine data={data} />
            </Suspense>
        </div>
    );
};

// ==================== GALLERY SECTION ====================
export const MobileGallerySection = ({ data }) => {
    return (
        <div className="mobile-section mobile-gallery-section">
            <Suspense fallback={<SectionLoader />}>
                <Gallery data={data} />
            </Suspense>
        </div>
    );
};

// ==================== CONTACT SECTION ====================
export const MobileContactSection = () => {
    return (
        <div className="mobile-section mobile-contact-section">
            <Suspense fallback={<SectionLoader />}>
                <Contact />
            </Suspense>
        </div>
    );
};

export default {
    MobileHomeSection,
    MobileFamilyTreeSection,
    MobileNewsSection,
    MobileArticlesSection,
    MobileConversationsSection,
    MobilePalestineSection,
    MobileGallerySection,
    MobileContactSection
};
