/**
 * Desktop Layout
 * ==============
 * Wrapper for the existing desktop/laptop experience.
 * This preserves the current website layout with no changes.
 * 
 * Acts as a container that maintains the traditional website structure:
 * - Fixed header with navigation
 * - Scrolling content sections
 * - Footer at the bottom
 */

import React from 'react';

const DesktopLayout = ({ children }) => {
    return (
        <div className="desktop-layout">
            {children}
        </div>
    );
};

export default DesktopLayout;
