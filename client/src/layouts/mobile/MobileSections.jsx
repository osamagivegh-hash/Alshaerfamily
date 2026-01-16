/**
 * Mobile Section Content Components
 * ==================================
 * Individual content sections optimized for mobile single-screen layout.
 * 
 * IMPORTANT: For Family Tree section, we use react-router navigation
 * to maintain the exact same page structure as desktop.
 * The mobile UI simply provides a different navigation entry point.
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

    // Quick action cards for home screen - matching website sections
    const quickActions = [
        {
            id: 'family-tree',
            label: 'شجرة العائلة',
            description: 'استكشف شجرة عائلة الشاعر',
            icon: '🌳',
            gradient: 'from-green-600 to-green-800',
            // Navigate to the actual family tree gateway page
            path: '/family-tree'
        },
        {
            id: 'news',
            label: 'آخر الأخبار',
            description: 'اطلع على أحدث الأخبار',
            icon: '📰',
            gradient: 'from-gray-700 to-gray-900',
            action: 'news'
        },
        {
            id: 'articles',
            label: 'المقالات',
            description: 'اقرأ أحدث المقالات',
            icon: '📖',
            gradient: 'from-emerald-600 to-teal-700',
            action: 'articles'
        },
        {
            id: 'gallery',
            label: 'معرض الصور',
            description: 'تصفح معرض الصور',
            icon: '🖼️',
            gradient: 'from-purple-600 to-indigo-700',
            action: 'gallery'
        }
    ];

    const handleAction = (item) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.action) {
            // This will be handled by LayoutContext for in-app navigation
            window.scrollTo(0, 0);
            // For now, we navigate to the hash section
            const sectionHash = `#${item.action}`;
            navigate('/' + sectionHash);
        }
    };

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
                            onClick={() => handleAction(action)}
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
// This section navigates to the actual FamilyTreeGateway page
// to maintain the same navigation structure as desktop
export const MobileFamilyTreeSection = () => {
    const navigate = useNavigate();

    // These buttons EXACTLY match the FamilyTreeGateway buttons
    // and navigate to the SAME routes
    const gatewayButtons = [
        {
            id: 'appreciation',
            label: 'تقدير ووفاء للمؤسس',
            color: '#1a1a1a',
            icon: '🏆',
            description: 'تعرف على تاريخ مؤسس شجرة العائلة وإرثه الخالد',
            path: '/family-tree/appreciation'
        },
        {
            id: 'discussions',
            label: 'حوارات مع المؤسس',
            color: '#CE1126',
            icon: '💬',
            description: 'حوارات ومناقشات مع مؤسس العائلة',
            path: '/family-tree/discussions'
        },
        {
            id: 'tree',
            label: 'شجرة العائلة',
            color: '#007A3D',
            icon: '🌳',
            description: 'استكشف شجرة العائلة التفاعلية',
            path: '/family-tree/tree'
        },
        {
            id: 'organic-olive',
            label: 'شجرة الزيتون',
            color: '#1B5E20',
            icon: '🫒',
            description: 'شجرة زيتون عضوية - كل ورقة تمثل فرداً من العائلة',
            path: '/family-tree/organic-olive'
        },
        {
            id: 'devTeam',
            label: 'فريق التطوير',
            color: '#0d9488',
            icon: '👨‍💻',
            description: 'تواصل مع فريق التطوير وشاركنا اقتراحاتك',
            path: '/family-tree/dev-team'
        }
    ];

    return (
        <div className="mobile-section mobile-family-tree-section">
            <div className="section-header">
                <h2 className="section-title">شجرة العائلة</h2>
                <p className="section-subtitle">استكشف شجرة عائلة الشاعر بطرق مختلفة</p>
            </div>

            {/* Gateway Buttons - Same as FamilyTreeGateway */}
            <div className="tree-options-grid">
                {gatewayButtons.map((button) => (
                    <button
                        key={button.id}
                        className="tree-option-card"
                        style={{ backgroundColor: button.color }}
                        onClick={() => navigate(button.path)}
                    >
                        <span className="option-icon">{button.icon}</span>
                        <div className="option-content">
                            <span className="option-label">{button.label}</span>
                            <span className="option-desc">{button.description}</span>
                        </div>
                        <svg className="option-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                ))}
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
