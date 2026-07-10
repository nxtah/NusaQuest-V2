/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: '481px',   // tablet+
        md: '769px',   // desktop+
        lg: '1025px',  // large desktop+
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        nq: {
          primary: '#FFB703',
          'primary-light': '#FFC857',
          'primary-dark': '#FF9502',
          sky: '#87CEEB',
          'sky-light': '#E0F6FF',
          sea: '#59A87D',
          text: '#1a1200',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        bauhaus: ['Bauhaus', 'sans-serif'],
      },
      borderRadius: {
        pill: '0.25rem',
      },
      boxShadow: {
        'nq-label': '0 8px 22px rgba(255, 184, 0, 0.14)',
        'nq-label-hover': '0 8px 22px rgba(255, 184, 0, 0.28)',
        'nq-island': '0 0.8vh 1.5vh rgba(0, 0, 0, 0.4)',
        'nq-board': '0 1vh 1.5vh rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        'nq-xs': '4px',
        'nq-sm': '8px',
        'nq-md': '12px',
        'nq-lg': '16px',
        'nq-xl': '24px',
        'nq-2xl': '32px',
        'nq-3xl': '48px',
      },
      fontSize: {
        'nq-label': ['0.5rem', { lineHeight: '1.2' }], // mobile label ~8px
        'nq-label-lg': ['0.875rem', { lineHeight: '1.5' }], // desktop label 14px
        'nq-heading': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.3' }],
      },
      zIndex: {
        'nq-bg': '0',
        'nq-clouds': '8',
        'nq-islands': '10',
        'nq-ornaments': '40',
        'nq-labels': '60',
        'nq-modal-overlay': '90',
        'nq-modal': '100',
        'nq-rotate': '110',
      },
    },
  },
  plugins: [],
}
