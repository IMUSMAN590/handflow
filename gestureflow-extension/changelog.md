# GestureFlow - Changelog

All notable changes to the GestureFlow Chrome extension project.

## [1.0.0] - 2026-04-25

### Added - Core Infrastructure
- Vite + React 18 + TypeScript + Tailwind CSS project scaffolding
- Chrome Manifest V3 configuration
- Path aliases (@shared) for clean imports
- Chrome extension build pipeline

### Added - Shared Types & Constants
- Complete type system: Gesture, Profile, Settings, Analytics, Message types
- 13 preset gestures with full configuration
- 5 preset profiles (Home, Presentation, Gaming, Accessibility, Media)
- Profile gesture mappings per profile type
- Chrome actions registry (13 browser actions)
- Website gesture packs (8 websites: YouTube, Spotify, Netflix, Google Docs, Gmail, Twitter/X, GitHub, ChatGPT)

### Added - State Management
- Zustand stores: Settings, Gesture, Analytics with Chrome storage persistence
- Custom hooks: useSettings, useProfile, useHandTracking, useGestureRecognition, useAnalytics

### Added - Background Service Worker
- Message handling for all extension communication
- Gesture engine with landmark processing, static/dynamic classification, confidence scoring, cooldown management, zone detection
- Action executor supporting Chrome actions, URL navigation, keyboard shortcuts, JavaScript execution
- Profile manager with switch, create, update, delete, and auto-switch based on URL
- Macro engine with record, create, delete, execute, and persistence
- Storage manager with settings, gestures, profiles, analytics, and IndexedDB for custom recordings

### Added - Content Script & Hand Tracking
- MediaPipe Hands integration with camera management, FPS tracking, visibility handling
- Static gesture detection: finger states, palm orientation, finger angles, landmark distances
- Dynamic gesture detection: swipe (4 directions), wave, velocity calculation, trajectory analysis
- Gesture classifier with static/dynamic fusion, confidence thresholding, cooldown, zone detection
- Two-hand detector: clap, cross hands, spread apart, come together, both palms open, both fists
- Visual feedback system: gesture name display, toast notifications, confidence indicator, trail effects, zone highlights, flash effects, drawing trails, night mode support
- Audio feedback: synthetic sound generation (whoosh, click, success, error), speech synthesis, volume control
- Haptic feedback: vibration patterns per gesture type, intensity control

### Added - Overlay Components
- OverlayApp: main overlay with camera preview, hand skeleton, gesture popup, confidence meter, trail effect, zone mini-map, drag/minimize/fullscreen controls
- CameraPreview: video display with hand skeleton overlay, zone grid lines, FPS indicator
- HandSkeleton: canvas-based hand skeleton renderer with color-coded finger connections
- GesturePopup: detected gesture name, action, and confidence percentage display
- ConfidenceMeter: SVG circular confidence meter with color coding (green/yellow/red)
- TrailEffect: canvas-based trail effect following index finger tip
- ZoneMiniMap: mini-map showing active gesture zones with hand position dot

### Added - Popup UI
- PopupApp: main popup with toggle switch, status indicator, camera preview, last gesture display, navigation tabs
- StatusIndicator: tracking state with animated pulse, FPS display, last gesture name
- CameraPreview: popup-specific camera preview with live indicator and error handling
- QuickSettings: sensitivity slider, profile selector, sound toggle, low power mode, night mode
- NavigationTabs: status, gestures, settings tab navigation

### Added - Options UI
- OptionsApp: sidebar navigation with page routing and responsive layout
- GeneralSettings: startup & display, recognition sensitivity, overlay position/size/opacity, modes (low power, night, drawing, proximity), keyboard shortcuts
- GestureManager: preset/custom gesture tabs, search, toggle enable/disable, edit modal, add custom gesture modal, macro builder, import/export JSON, reset to defaults
- ProfileManager: profile cards with active indicator, create custom profile modal, website gesture packs display, auto-switch URL configuration
- ZoneConfig: visual zone grid editor, per-zone action assignment, add/remove actions, how zones work explanation
- AudioSettings: sound effects toggle and volume, speech feedback toggle and volume, haptic feedback toggle and intensity, visual feedback toggles
- AnalyticsDashboard: 4 metric cards, weekly usage area chart, gesture distribution pie chart, confidence bar chart, gesture heatmap, achievements grid
- IntegrationSettings: website gesture packs with toggle, extension API documentation, voice+gesture combo reference
- HelpPage: 4-step getting started guide, gesture reference grid, keyboard shortcuts, privacy guarantees, version info

### Added - Advanced Features
- Drawing Mode (S1): draw shapes in air (circle, X, checkmark, arrows) to trigger actions, pinch-to-draw interaction
- Proximity-Based Actions (S2): detect hand proximity (close/medium/far) for context-aware behavior scaling
- Gesture Streaks & Gamification (S3): badge system, streak tracking, achievements in analytics dashboard
- Gesture Password (S8): multi-gesture sequence authentication engine with step-by-step matching and timeout
- Gesture Shortcuts Widget (S6): context-aware floating widget showing relevant gestures based on current website
- Night Mode (S7): overlay dimming with adjustable opacity and auto-start timer
- Voice + Gesture Combo (S10): Web Speech API integration for combined voice+gesture command recognition
- Extension API (F14): public API for other extensions (onGesture, registerGesture, triggerAction, getState)

### Added - Assets
- Logo set: icon, full, dark, light, wordmark (SVG)
- Status icons: active, inactive, loading, camera-on, camera-off (SVG)
- Gesture icons: 13 gesture icons (SVG)
- Action icons: 11 action icons (SVG)
- Navigation icons: 8 nav icons (SVG)
- Metric icons: 8 metric icons (SVG)
- Profile icons: 5 profile icons (SVG)
- Promotional banners: 6 banners for Chrome Web Store (SVG)
- Extension icons: 4 sizes (16, 32, 48, 128 SVG)

### Fixed
- Renamed content-script.ts to content-script.tsx for JSX support
- Updated Vite config and manifest to reference .tsx file
- Fixed all TypeScript compilation errors (0 errors)
- Cleaned up unused imports and variables across all files
- Fixed message listener type compatibility in content script
- Fixed duplicate method names in shortcuts-widget.ts
- Fixed SpeechRecognition type issues in voice-gesture-combo.ts
- Added isSpeaking() method to audio-feedback.ts to resolve unused variable warning

### Build
- Production build successful (Vite + Rollup)
- Output: popup.js (12.9KB), options.js (473.6KB), content.js (80.4KB), background.js (20.2KB)
