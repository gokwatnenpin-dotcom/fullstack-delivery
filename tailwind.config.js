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
          50: '#eff9f7', 100: '#d9f0ec', 200: '#b9e3dc', 300: '#86cfc5', 400: '#4daea4', 500: '#278b83', 600: '#17766f', 700: '#125e59', 800: '#134b48', 900: '#123c39',
        },
        secondary: {
          50: '#f3faf7', 100: '#ddf1e7', 200: '#bde2cf', 300: '#8ecbad', 400: '#5cac82', 500: '#3d9369', 600: '#2d7956', 700: '#256145', 800: '#204d38', 900: '#1c4031',
        },
        // Backgrounds
        background: {
          light: '#ffffff',
          dark: '#f4f8f7',
        },
        // Text
        text: {
          primary: '#183b3a', secondary: '#5d7472',
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
    'bg-background-dark',
    'text-text-primary',
    'text-text-secondary',
    'hover:bg-primary-700',
    'focus:ring-primary-300',
    'focus:ring-secondary-300',
    'bg-white/80',
    'hover:bg-gray-50',
    'hover:text-primary-600',
  ],
  plugins: [],
}