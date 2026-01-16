# Dual-Layout Architecture Documentation

## Overview

This document explains the responsive dual-layout system implemented for the Al-Shaer Family website. The system provides two completely different UI experiences:

- **Desktop/Laptop**: Traditional website layout (preserved as-is)
- **Mobile**: App-like single-screen experience

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                 │
│                    (Entry Point + Providers)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LayoutProvider                               │
│    (Context for device info, navigation state, mobile state)    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                ResponsiveLayoutWrapper                           │
│         (JS-based device detection + layout switching)           │
└───────────┬─────────────────────────────────┬───────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────┐           ┌─────────────────────────────┐
│    DesktopLayout    │           │       MobileLayout          │
│    (Original UI)    │           │    (App-like UI)            │
└──────────┬──────────┘           └────────────┬────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────────────┐
│     PublicApp       │           │  ┌──────────────────────┐  │
│  (Existing website) │           │  │   MobileHeader       │  │
└─────────────────────┘           │  ├──────────────────────┤  │
                                  │  │   MobileContent      │  │
                                  │  │   (Section tabs)     │  │
                                  │  ├──────────────────────┤  │
                                  │  │   MobileBottomNav    │  │
                                  │  └──────────────────────┘  │
                                  └─────────────────────────────┘
```

## File Structure

```
client/src/
├── hooks/
│   └── useDeviceDetection.js    # Core device detection hook
│
├── contexts/
│   └── LayoutContext.jsx        # Layout state management
│
├── layouts/
│   ├── index.js                 # Central exports
│   ├── DesktopLayout.jsx        # Desktop wrapper (minimal)
│   └── mobile/
│       ├── MobileLayout.jsx     # Main mobile layout
│       ├── MobileHeader.jsx     # Compact header
│       ├── MobileBottomNav.jsx  # Bottom navigation
│       └── MobileSections.jsx   # Section components
│
├── components/
│   └── ResponsiveLayoutWrapper.jsx  # Layout switcher
│
└── styles/
    └── mobile.css               # Mobile-specific styles
```

## Key Components

### 1. Device Detection (`useDeviceDetection.js`)

JavaScript-based detection using multiple signals:
- Screen width (primary signal)
- Touch capability
- User agent detection

```javascript
// Usage
const { isMobile, isDesktop, deviceType, isTouch } = useDeviceDetection();
```

**Why JS-based instead of CSS-only?**
- Allows conditional rendering of completely different component trees
- Better for performance (doesn't load unused components)
- Enables different data fetching strategies
- Preserves same API/data sources

### 2. Layout Context (`LayoutContext.jsx`)

Manages mobile-specific state:
- Active section/tab
- Navigation functions
- "More" menu state
- Swipe gesture state

```javascript
// Usage
const { 
  activeSection, 
  navigateToSection, 
  isMoreMenuOpen 
} = useLayout();
```

### 3. Responsive Layout Wrapper (`ResponsiveLayoutWrapper.jsx`)

Central switching component that renders either:
- `MobileLayout` for mobile devices
- `DesktopLayout > PublicApp` for desktop

```javascript
if (showMobileLayout) {
  return <MobileLayout />;
}
return (
  <DesktopLayout>
    <PublicApp />
  </DesktopLayout>
);
```

### 4. Mobile Layout (`MobileLayout.jsx`)

App-like structure with:
- Fixed header (compact, 56px)
- Scrollable content area
- Fixed bottom navigation (64px)
- Swipe gesture support

### 5. Mobile Bottom Navigation (`MobileBottomNav.jsx`)

Features:
- 5 main tabs: Home, Family Tree, News, Articles, More
- "More" expandable menu for additional sections
- Active state indicators
- Large touch targets (48px minimum)

### 6. Mobile Sections (`MobileSections.jsx`)

Individual section components optimized for mobile:
- `MobileHomeSection` - Quick actions grid
- `MobileFamilyTreeSection` - Tree navigation options
- `MobileNewsSection` - Wrapped existing News component
- etc.

## Design Decisions

### Touch-First Design
- Minimum tap target: 48x48px (iOS/Android guidelines)
- Generous spacing between interactive elements
- Active states with `transform: scale()` for feedback
- Swipe gestures for natural navigation

### Single-Screen Layout
- No long scrolling pages
- Tab-based section switching
- Content fits within viewport
- Minimal vertical scrolling within sections

### Safe Areas
- iOS safe area insets supported
- `env(safe-area-inset-*)` CSS functions
- Bottom navigation accounts for home indicator

### RTL Support
- All layouts respect RTL direction
- Touch gestures account for RTL (swipe directions)
- Text alignment: right-to-left

## CSS Variables

The mobile layout uses dedicated CSS variables:

```css
:root {
  --mobile-header-height: 56px;
  --mobile-nav-height: 64px;
  --mobile-safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --mobile-safe-area-top: env(safe-area-inset-top, 0px);
  --touch-target-min: 48px;
  /* ... color and transition variables */
}
```

## Data Flow

Both layouts share:
- ✅ Same API endpoints
- ✅ Same data fetching utilities (`fetchSectionsData`)
- ✅ Same business logic
- ✅ Same context providers (Admin, Auth)

No duplication of:
- ❌ API calls
- ❌ Data processing
- ❌ Authentication logic
- ❌ State management

## Adding New Sections

To add a new section to mobile:

1. Create section component in `MobileSections.jsx`
2. Add to `MOBILE_SECTIONS` or `MORE_SUBSECTIONS` in `LayoutContext.jsx`
3. Add case in `MobileLayout.renderSection()`
4. Add icon to `MobileBottomNav.NavIcon`
5. Add styles to `mobile.css`

## Breakpoints

| Device Type | Width Range | Layout |
|------------|-------------|--------|
| Mobile     | < 768px     | MobileLayout |
| Tablet     | 768-1023px  | DesktopLayout* |
| Desktop    | ≥ 1024px    | DesktopLayout |

*Tablets default to desktop for now; can be customized.

## Testing

To test mobile layout on desktop:
1. Open browser DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device or custom dimensions < 768px
4. Reload page to trigger device detection

## Performance Considerations

- Lazy loading of section components
- Conditional rendering (no hidden desktop content on mobile)
- CSS animations use `transform` (GPU accelerated)
- Touch events with passive listeners
- Debounced resize handlers

## Future Enhancements

Potential improvements:
- [ ] Offline support with service worker
- [ ] Pull-to-refresh gestures
- [ ] Haptic feedback integration
- [ ] PWA manifest for "Add to Home Screen"
- [ ] Dark mode support for mobile
- [ ] Tablet-specific layout (hybrid)
