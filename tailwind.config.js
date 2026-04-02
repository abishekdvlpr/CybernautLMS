/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ⬅️ Add this line to enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
  poppins: ['Poppins', 'sans-serif'],
},
keyframes: {
  'shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  },
  'float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-8px)' }
  },
  'gradient-shift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  },
  'orb-drift-1': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
  },
  'orb-drift-2': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '33%': { transform: 'translate(-40px, 30px) scale(0.95)' },
    '66%': { transform: 'translate(25px, -40px) scale(1.05)' }
  },
},
animation: {
  'shimmer': 'shimmer 2s infinite',
  'float': 'float 3s ease-in-out infinite',
  'gradient-shift': 'gradient-shift 6s ease infinite',
  'orb-1': 'orb-drift-1 20s ease-in-out infinite',
  'orb-2': 'orb-drift-2 25s ease-in-out infinite',
}

      /**animation: {
        'fadeIn': 'fadeIn 0.6s ease-in-out',
        'slideUp': 'slideUp 0.6s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      }**/
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],

}
