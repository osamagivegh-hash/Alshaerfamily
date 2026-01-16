/**
 * Responsive Layout Wrapper
 * =========================
 * Main component that switches between Desktop and Mobile layouts
 * based on device detection. This is the entry point for the dual-layout system.
 * 
 * Architecture:
 * - Uses JavaScript-based device detection (not CSS-only)
 * - Conditionally renders completely different component trees
 * - Shares data sources and API calls
 * - No duplicated business logic
 */

import React from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { DesktopLayout, MobileLayout } from '../layouts';

// Import original PublicApp for desktop
import PublicApp from './PublicApp';

const ResponsiveLayoutWrapper = () => {
    const { showMobileLayout, deviceInfo } = useLayout();

    // Log device info for debugging (can be removed in production)
    React.useEffect(() => {
        console.log('[Layout] Device detected:', deviceInfo.deviceType, {
            width: deviceInfo.screenWidth,
            isTouch: deviceInfo.isTouch,
            showMobile: showMobileLayout
        });
    }, [deviceInfo, showMobileLayout]);

    // Render mobile layout for mobile devices
    if (showMobileLayout) {
        return <MobileLayout />;
    }

    // Render desktop layout (preserving existing design)
    return (
        <DesktopLayout>
            <PublicApp />
        </DesktopLayout>
    );
};

export default ResponsiveLayoutWrapper;
