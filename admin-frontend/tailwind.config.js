/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1877F2',
          hover: '#1565D8',
        },
        background: '#F0F2F5',
        surface: '#FFFFFF',
        text: {
          primary: '#1C1E21',
          secondary: '#65676B',
        },
        border: '#E4E6EB',
        success: '#31A24C',
        error: '#E41E3F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontWeight: {
        thin: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      screens: {
        xs: '400px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.07)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
