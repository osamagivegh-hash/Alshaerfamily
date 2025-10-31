/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Palestinian flag inspired colors
        'palestine': {
          'red': '#CE1126',
          'black': '#000000',
          'white': '#FFFFFF',
          'green': '#007A3D',
        },
        // Additional complementary colors
        'olive': {
          50: '#f7f8f3',
          100: '#eef1e7',
          200: '#dde3cf',
          300: '#c5d0ac',
          400: '#a8b882',
          500: '#8fa05f',
          600: '#738249',
          700: '#5a653a',
          800: '#495130',
          900: '#3e4529',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
