/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Delivery platform theme colors
        primary: {
          50: '#fff0e6', 100: '#ffd8b3', 200: '#ffc080', 300: '#ffa84d', 400: '#ff8f1a', 500: '#ff5a00', 600: '#cc4800', 700: '#993900', 800: '#662600', 900: '#331300',
        },
        secondary: {
          50: '#f2f2f2', 100: '#e6e6e6', 200: '#cccccc', 300: '#b3b3b3', 400: '#999999', 500: '#808080', 600: '#666666', 700: '#4d4d4d', 800: '#333333', 900: '#1a1a1a',
        },
        // Backgrounds
        background: {
          light: '#f8f9fa',
          white: '#ffffff',
        },
        // Accent/Success
        accent: {
          50: '#e0f9f1', 100: '#b9f3d9', 200: '#92edc0', 300: '#6ae6a8', 400: '#42e090', 500: '#00b074', 600: '#008d5d', 700: '#006a46', 800: '#00472f', 900: '#002419',
        },
        // Text
        text: {
          primary: '#1a1a1a', // secondary color for primary text
          secondary: '#666666', // for secondary text
        },
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  safelist: [
    'bg-primary-900',
    'text-primary-900',
    'bg-secondary-600',
    'text-secondary-600',
    'bg-background-light',
    'bg-background-white',
    'text-text-primary',
    'text-text-secondary',
    'hover:bg-primary-700',
    'focus:ring-primary-300',
    'focus:ring-accent-500',
    'bg-white/80',
    'hover:bg-gray-50',
    'hover:text-primary-600',
    'bg-accent-500',
    'text-accent-500',
    'hover:bg-accent-600',
    'focus:ring-accent-300',
  ],
  plugins: [],
}