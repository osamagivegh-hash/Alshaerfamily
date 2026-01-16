/**
 * Mobile Layout
 * =============
 * Main mobile layout component providing app-like single-screen experience.
 * 
 * Features:
 * - Single-screen layout (no long scrolling pages)
 * - Bottom navigation for section switching
 * - Swipe gesture support for navigation
 * - Tab-based section switching
 * - Touch-first design with large tap targets
 * - Smooth transitions between sections
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import {
    MobileHomeSection,
    MobileFamilyTreeSection,
    MobileNewsSection,
    MobileArticlesSection,
    MobileConversationsSection,
    MobilePalestineSection,
    MobileGallerySection,
    MobileContactSection
} from './MobileSections';
import { fetchSectionsData } from '../../utils/api';

const MobileLayout = () => {
    const {
        activeSection,
        navigateBySwipe,
        swipeDirection,
        isMoreMenuOpen
    } = useLayout();

    // Data state
    const [sectionsData, setSectionsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Swipe handling refs
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndX = useRef(0);
    const contentRef = useRef(null);

    // Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchSectionsData();
                setSectionsData(data);
            } catch (err) {
                setError('فشل في تحميل البيانات');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Swipe gesture handlers
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        const deltaX = touchStartX.current - touchEndX.current;
        const deltaY = Math.abs(touchStartY.current - touchEndX.current);
        const minSwipeDistance = 50;

        // Only trigger swipe if horizontal movement is significant
        // and greater than vertical movement
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
            if (deltaX > 0) {
                // Swiped left (in RTL, this goes to next)
                navigateBySwipe('right');
            } else {
                // Swiped right (in RTL, this goes to previous)
                navigateBySwipe('left');
            }
        }
    }, [navigateBySwipe]);

    // Render current section content
    const renderSection = () => {
        if (loading) {
            return (
                <div className="mobile-loading-state">
                    <div className="loading-spinner"></div>
                    <p>جاري تحميل المحتوى...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="mobile-error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>خطأ في التحميل</h3>
                    <p>{error}</p>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            );
        }

        switch (activeSection) {
            case 'home':
                return <MobileHomeSection data={sectionsData} />;
            case 'family-tree':
                return <MobileFamilyTreeSection />;
            case 'news':
                return <MobileNewsSection data={sectionsData?.news || []} />;
            case 'articles':
                return <MobileArticlesSection data={sectionsData?.articles || []} />;
            case 'conversations':
                return <MobileConversationsSection data={sectionsData?.conversations || []} />;
            case 'palestine':
                return <MobilePalestineSection data={sectionsData?.palestine || []} />;
            case 'gallery':
                return <MobileGallerySection data={sectionsData?.gallery || []} />;
            case 'contact':
                return <MobileContactSection />;
            default:
                return <MobileHomeSection data={sectionsData} />;
        }
    };

    // Transition class based on swipe direction
    const getTransitionClass = () => {
        if (!swipeDirection) return '';
        return swipeDirection === 'left'
            ? 'slide-in-from-right'
            : 'slide-in-from-left';
    };

    return (
        <div className={`mobile-layout ${isMoreMenuOpen ? 'overlay-open' : ''}`}>
            {/* Mobile Header */}
            <MobileHeader />

            {/* Main Content Area */}
            <main
                ref={contentRef}
                className={`mobile-content ${getTransitionClass()}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {renderSection()}
            </main>

            {/* Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default MobileLayout;
