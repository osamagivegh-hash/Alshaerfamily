/**
 * Device Detection Hook
 * =====================
 * Provides JavaScript-based detection for device type (mobile vs desktop).
 * Uses multiple signals: screen width, touch capability, and user agent.
 * 
 * This approach is preferred over CSS-only media queries for layout switching
 * because it allows conditional rendering of completely different component trees.
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoint for mobile/desktop separation (in pixels)
const MOBILE_BREAKPOINT = 768;

// Device types enum
export const DeviceType = {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop'
};

/**
 * Check if the device is a touch device
 */
const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
    );
};

/**
 * Check if user agent suggests mobile device
 */
const isMobileUserAgent = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
    return mobileRegex.test(userAgent.toLowerCase());
};

/**
 * Get the device type based on screen width
 */
const getDeviceTypeFromWidth = (width) => {
    if (width < MOBILE_BREAKPOINT) return DeviceType.MOBILE;
    if (width < 1024) return DeviceType.TABLET;
    return DeviceType.DESKTOP;
};

/**
 * Custom hook for device detection
 * Returns device information and utility functions
 */
export const useDeviceDetection = () => {
    const [deviceInfo, setDeviceInfo] = useState(() => {
        // Initial state (SSR-safe defaults)
        if (typeof window === 'undefined') {
            return {
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                deviceType: DeviceType.DESKTOP,
                screenWidth: 1200,
                screenHeight: 800,
                isTouch: false,
                isPortrait: false,
                isLandscape: true
            };
        }

        const width = window.innerWidth;
        const height = window.innerHeight;
        const deviceType = getDeviceTypeFromWidth(width);
        const isTouch = isTouchDevice();
        const isMobileUA = isMobileUserAgent();

        // Combine signals: prioritize user agent for mobile detection
        // but also consider screen size for edge cases (desktop with small window)
        const effectivelyMobile = deviceType === DeviceType.MOBILE || (isMobileUA && isTouch);

        return {
            isMobile: effectivelyMobile,
            isTablet: deviceType === DeviceType.TABLET,
            isDesktop: !effectivelyMobile && deviceType !== DeviceType.TABLET,
            deviceType: effectivelyMobile ? DeviceType.MOBILE : deviceType,
            screenWidth: width,
            screenHeight: height,
            isTouch: isTouch,
            isPortrait: height > width,
            isLandscape: width >= height
        };
    });

    const updateDeviceInfo = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const deviceType = getDeviceTypeFromWidth(width);
        const isTouch = isTouchDevice();
        const isMobileUA = isMobileUserAgent();

        // Combine signals for accurate detection
        const effectivelyMobile = deviceType === DeviceType.MOBILE || (isMobileUA && isTouch && width < 1024);

        setDeviceInfo({
            isMobile: effectivelyMobile,
            isTablet: deviceType === DeviceType.TABLET && !effectivelyMobile,
            isDesktop: !effectivelyMobile && deviceType === DeviceType.DESKTOP,
            deviceType: effectivelyMobile ? DeviceType.MOBILE : deviceType,
            screenWidth: width,
            screenHeight: height,
            isTouch: isTouch,
            isPortrait: height > width,
            isLandscape: width >= height
        });
    }, []);

    useEffect(() => {
        // Update on mount
        updateDeviceInfo();

        // Debounced resize handler
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updateDeviceInfo, 150);
        };

        // Listen for resize events
        window.addEventListener('resize', handleResize);

        // Listen for orientation change
        window.addEventListener('orientationchange', () => {
            // Small delay to let the browser update dimensions
            setTimeout(updateDeviceInfo, 100);
        });

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', updateDeviceInfo);
        };
    }, [updateDeviceInfo]);

    return deviceInfo;
};

/**
 * Hook to get just the mobile/desktop boolean
 * Simpler API for components that just need to know if mobile
 */
export const useIsMobile = () => {
    const { isMobile } = useDeviceDetection();
    return isMobile;
};

/**
 * Utility function for conditional class names based on device
 */
export const deviceClass = (deviceInfo, classes) => {
    if (deviceInfo.isMobile && classes.mobile) return classes.mobile;
    if (deviceInfo.isTablet && classes.tablet) return classes.tablet;
    if (deviceInfo.isDesktop && classes.desktop) return classes.desktop;
    return classes.default || '';
};

export default useDeviceDetection;
