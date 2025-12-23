/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Primary Colors (Coffee Base)
        primary: {
          50: '#FAF5F0',
          100: '#F5EFE6',   // Latte Beige (background)
          200: '#E6E0D8',   // Milk Foam Grey (borders)
          300: '#C7A17A',   // Mocha Tan (highlights)
          400: '#A47148',   // Caramel Brown (secondary)
          500: '#7B5D43',   // Mid-tone
          600: '#4E342E',   // Espresso Brown (main brand)
          700: '#3D2922',   // Darker espresso
          800: '#2B1B17',   // Dark Roast (text)
          900: '#1A100D',   // Darkest
          950: '#0D0806',
        },
        // Semantic color mappings
        espresso: '#4E342E',
        latte: '#F5EFE6',
        mocha: '#C7A17A',
        caramel: '#A47148',
        olive: '#6B8E23',
        'burnt-orange': '#D2691E',
        'dark-roast': '#2B1B17',
        'ash-brown': '#7B6F6A',
        'milk-foam': '#E6E0D8',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
