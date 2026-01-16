/**
 * Mobile Header
 * =============
 * Compact, app-like header for mobile layout.
 * Features:
 * - Minimal height for maximum content space
 * - Dynamic title based on active section
 * - Quick actions (search, notifications)
 * - Smooth transitions
 */

import React, { useState } from 'react';
import { useLayout } from '../../contexts/LayoutContext';

const MobileHeader = () => {
    const { activeSection, sections, subSections } = useLayout();
    const [showSearch, setShowSearch] = useState(false);

    // Get current section info
    const currentSection = [...sections, ...subSections].find(s => s.id === activeSection);
    const sectionTitle = currentSection?.label || 'الرئيسية';

    // Get section color
    const sectionColor = currentSection?.color || '#007A3D';

    if (showSearch) {
        return (
            <header className="mobile-header mobile-header-search">
                <div className="mobile-header-inner">
                    <button
                        className="mobile-header-back"
                        onClick={() => setShowSearch(false)}
                        aria-label="إغلاق البحث"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <input
                        type="search"
                        className="mobile-search-input"
                        placeholder="ابحث في الموقع..."
                        autoFocus
                        dir="rtl"
                    />
                </div>
            </header>
        );
    }

    return (
        <header className="mobile-header" style={{ '--header-accent': sectionColor }}>
            <div className="mobile-header-inner">
                {/* Logo/Brand */}
                <div className="mobile-header-brand">
                    <div className="mobile-header-logo">
                        <span className="logo-text">عائلة الشاعر</span>
                    </div>
                    {activeSection !== 'home' && (
                        <span className="mobile-header-section-badge">
                            {sectionTitle}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="mobile-header-actions">
                    {/* Search Button */}
                    <button
                        className="mobile-header-action"
                        onClick={() => setShowSearch(true)}
                        aria-label="بحث"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Palestine Flag Bar */}
            <div className="mobile-header-flag-bar">
                <div className="flag-segment flag-black"></div>
                <div className="flag-segment flag-white"></div>
                <div className="flag-segment flag-green"></div>
                <div className="flag-segment flag-red"></div>
            </div>
        </header>
    );
};

export default MobileHeader;
