import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Age group specific colors
        'age-5-8': {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecccc',
          300: '#fba3a0',
          400: '#f77066',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
          800: '#912221',
          900: '#55160c',
        },
        'age-9-12': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
      },
      fontSize: {
        // Age-appropriate font sizes
        'age-5-8': '1.125rem',
        'age-9-12': '1rem',
      },
      spacing: {
        // Touch-friendly spacing for mobile (min 48px)
        'touch': '3rem',
      },
    },
  },
  plugins: [],
}

export default config
