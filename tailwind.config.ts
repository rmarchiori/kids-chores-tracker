import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Young theme classes
    'bg-young-primary', 'hover:bg-young-primary-hover',
    'bg-young-success', 'hover:bg-young-success-hover',
    'bg-young-pending', 'hover:bg-young-pending-hover',
    'bg-young-bg', 'bg-young-surface',
    'text-young-text', 'text-young-text-secondary',
    'border-young-border',
    'text-young', 'font-young', 'rounded-young', 'p-young-card',

    // Older theme classes
    'bg-older-primary', 'hover:bg-older-primary-hover',
    'bg-older-success', 'hover:bg-older-success-hover',
    'bg-older-pending', 'hover:bg-older-pending-hover',
    'bg-older-bg', 'bg-older-surface',
    'text-older-text', 'text-older-text-secondary',
    'border-older-border',
    'text-older', 'font-older', 'rounded-older', 'p-older-card',

    // Parent theme classes
    'bg-parent-primary', 'hover:bg-parent-primary-hover',
    'bg-parent-success', 'hover:bg-parent-success-hover',
    'bg-parent-warning', 'hover:bg-parent-warning-hover',
    'bg-parent-urgent', 'hover:bg-parent-urgent-hover',
    'bg-parent-bg', 'bg-parent-surface',
    'text-parent-text', 'text-parent-text-secondary',
    'border-parent-border',
    'text-parent', 'font-parent', 'rounded-parent', 'p-parent-card',
  ],
  theme: {
    extend: {
      colors: {
        // Young theme (5-8 years) - Bright & Playful (WCAG AA compliant)
        'young': {
          primary: '#DC143C',        // Crimson - 4.5:1 contrast with white
          'primary-hover': '#B8102E',
          success: '#00857A',        // Dark teal - 4.5:1 contrast
          'success-hover': '#00766D',
          pending: '#D4A60A',        // Dark gold - 4.5:1 contrast
          'pending-hover': '#BD9409',
          bg: '#F7F7FF',
          surface: '#FFFFFF',
          text: '#2D3748',
          'text-secondary': '#4A5568',
          border: '#E2E8F0',
        },
        // Older theme (9-12 years) - Cool & Mature (WCAG AA compliant)
        'older': {
          primary: '#6C5CE7',        // Already passes 4.5:1!
          'primary-hover': '#5F4FD1',
          success: '#00756C',        // Darker green - 4.5:1 contrast
          'success-hover': '#006B63',
          pending: '#D4A60A',        // Dark gold - 4.5:1 contrast
          'pending-hover': '#BD9409',
          bg: '#DFE6E9',
          surface: '#FFFFFF',
          text: '#2D3748',
          'text-secondary': '#4A5568',
          border: '#CBD5E0',
        },
        // Parent theme - Calm & Professional (WCAG AA compliant)
        'parent': {
          primary: '#0770D0',        // Darker blue - 4.5:1 contrast
          'primary-hover': '#0660B8',
          success: '#00756C',        // Darker green - 4.5:1 contrast
          'success-hover': '#006B63',
          warning: '#D4A60A',        // Dark gold - 4.5:1 contrast
          'warning-hover': '#BD9409',
          urgent: '#C41E3A',         // Dark red - 4.5:1 contrast
          'urgent-hover': '#A8192F',
          bg: '#FFFFFF',
          surface: '#F8F9FA',
          text: '#2D3748',
          'text-secondary': '#718096',
          border: '#E2E8F0',
        },
      },
      fontSize: {
        'young': '18px',      // 5-8 years - larger for readability
        'older': '16px',      // 9-12 years - standard size
        'parent': '14px',     // Parents - efficient information density
      },
      fontWeight: {
        'young': '600',       // Semi-bold for emphasis
        'older': '500',       // Medium weight
        'parent': '400',      // Regular weight
      },
      borderRadius: {
        'young': '16px',      // Very rounded, friendly
        'older': '12px',      // Slightly rounded
        'parent': '8px',      // Subtle rounding
      },
      spacing: {
        // Touch-friendly spacing for mobile (min 48px)
        'touch': '3rem',
        // Age-specific padding
        'young-card': '24px',
        'older-card': '20px',
        'parent-card': '16px',
      },
    },
  },
  plugins: [],
}

export default config
