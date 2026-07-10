/**
 * NusaQuest Design Tokens
 *
 * Single source of truth for responsive breakpoints, spacing, typography,
 * colors, gradients, and z-index layers. These tokens are consumed by:
 *   1. Tailwind config (tailwind.config.js) for utility classes
 *   2. Pure CSS files (src/styles/tokens.css) via CSS custom properties
 *
 * IMPORTANT: When updating any value here, also sync to the corresponding
 * location (Tailwind theme / CSS variables).
 */

// ─── BREAKPOINTS ───────────────────────────────────────────────
// Mobile-first tiers. Keep in sync with tailwind.config.js `screens`.
export const BREAKPOINTS = {
  mobile: 480, // ≤ 480px: phone portrait
  tablet: 768, // 481–768px: tablet / large phone landscape
  desktop: 1024, // ≥ 1025px: desktop / laptop
} as const;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Tailwind screen config (exported for tailwind.config.js consistency)
export const TAILWIND_SCREENS = {
  sm: `${BREAKPOINTS.mobile + 1}px`, // 481px
  md: `${BREAKPOINTS.tablet + 1}px`, // 769px
  lg: `${BREAKPOINTS.desktop + 1}px`, // 1025px
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── SPACING SCALE ─────────────────────────────────────────────
// Base unit 4px. Used for padding/gap/margin consistency.
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────
// Fluid font sizes using clamp(min, preferred, max).
// Preferred uses vw so text scales smoothly between breakpoints.
export const FONT_SIZES = {
  // Labels & badges
  labelMobile: 'clamp(0.5rem, 2.2vw, 0.75rem)', // ~8px → 12px
  labelDesktop: 'clamp(0.875rem, 1.4vw, 1rem)', // 14px → 16px

  // Headings
  h1: 'clamp(1.75rem, 4vw, 3rem)',
  h2: 'clamp(1.5rem, 3vw, 2.25rem)',
  h3: 'clamp(1.125rem, 2vw, 1.5rem)',

  // Body
  body: 'clamp(0.875rem, 1.5vw, 1rem)',
  small: 'clamp(0.75rem, 1.2vw, 0.875rem)',
} as const;

// ─── COLORS ───────────────────────────────────────────────────
// NusaQuest brand palette
export const COLORS = {
  // Primary brand
  primary: '#FFB703', // NusaQuest yellow
  primaryLight: '#FFC857',
  primaryDark: '#FF9502',

  // Sky / background
  skyTop: '#87CEEB',
  skyBottom: '#E0F6FF',
  sea: '#59A87D',

  // UI
  white: '#FFFFFF',
  black: '#1A1A1A',
  textDark: '#1a1200',

  // Game-specific
  gameYellow: '#FFC857',
  gameYellowDark: '#FFB703',
} as const;

// ─── GRADIENTS ────────────────────────────────────────────────
export const GRADIENTS = {
  // Island label pill (game variant)
  labelPill: 'linear-gradient(135deg, #FFC857 0%, #FFB703 70%)',
  labelPillHover: 'linear-gradient(135deg, #FFDB6B 0%, #FFC857 100%)',

  // Background sky
  sky: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)',

  // Modal container
  modalPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
} as const;

// ─── Z-INDEX LAYERS ───────────────────────────────────────────
// Consistent stacking context for game UI
export const Z_INDEX = {
  background: 0,
  sea: 2,
  sky: 1,
  clouds: 8,
  islands: 10,
  labels: 60,
  ornaments: 40,
  cornerIsland: 15,
  modalOverlay: 90,
  modal: 100,
  rotateOverlay: 110,
} as const;

// ─── TOUCH TARGETS ────────────────────────────────────────────
export const TOUCH_TARGET = {
  min: '44px', // WCAG minimum
  comfortable: '48px',
} as const;

// ─── SHADOWS ──────────────────────────────────────────────────
export const SHADOWS = {
  label: '0 8px 22px rgba(255, 184, 0, 0.14)',
  labelHover: '0 8px 22px rgba(255, 184, 0, 0.28)',
  island: '0 0.8vh 1.5vh rgba(0, 0, 0, 0.4)',
  board: '0 1vh 1.5vh rgba(0, 0, 0, 0.5)',
} as const;

// ─── ANIMATION TIMING ────────────────────────────────────────
export const ANIMATION = {
  fast: '0.2s',
  base: '0.3s',
  slow: '0.5s',
  easeOut: 'cubic-bezier(0.175, 0.885, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
