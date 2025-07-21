/**
 * Design System Configuration
 * Establishes consistent spacing, typography, and color tokens
 */

export const SPACING_SCALE = {
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
} as const;

export const TYPOGRAPHY_SCALE = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
} as const;

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const LINE_HEIGHTS = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const;

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

export const Z_INDEX = {
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
} as const;

// Semantic color tokens for consistent usage
export const SEMANTIC_COLORS = {
  success: {
    light: 'text-green-600 bg-green-50 border-green-200',
    dark: 'text-green-400 bg-green-900/20 border-green-700',
  },
  warning: {
    light: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    dark: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
  },
  error: {
    light: 'text-red-600 bg-red-50 border-red-200',
    dark: 'text-red-400 bg-red-900/20 border-red-700',
  },
  info: {
    light: 'text-blue-600 bg-blue-50 border-blue-200',
    dark: 'text-blue-400 bg-blue-900/20 border-blue-700',
  },
} as const;

// Component spacing presets
export const COMPONENT_SPACING = {
  toolbar: {
    padding: 'p-4',
    gap: 'gap-3',
    border: 'border border-border',
    radius: 'rounded-lg',
    shadow: 'shadow-sm',
  },
  card: {
    padding: 'p-6',
    gap: 'gap-4',
    border: 'border border-border',
    radius: 'rounded-lg',
    shadow: 'shadow-sm',
  },
  button: {
    padding: 'px-4 py-2',
    gap: 'gap-2',
    radius: 'rounded-md',
  },
  dialog: {
    padding: 'p-6',
    gap: 'gap-4',
    radius: 'rounded-lg',
    shadow: 'shadow-lg',
  },
} as const;

// Utility function to generate consistent spacing classes
export const createSpacingClasses = (type: 'padding' | 'margin', size: keyof typeof SPACING_SCALE) => {
  const value = SPACING_SCALE[size];
  const remValue = parseInt(value) / 16;
  return `${type === 'padding' ? 'p' : 'm'}-${Math.round(remValue * 4)}`;
};

// Utility function to generate consistent gap classes
export const createGapClasses = (size: keyof typeof SPACING_SCALE) => {
  const value = SPACING_SCALE[size];
  const remValue = parseInt(value) / 16;
  return `gap-${Math.round(remValue * 4)}`;
}; 