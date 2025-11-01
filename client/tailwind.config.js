const { blackA, violet } = require('@radix-ui/colors');
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    container: {
      // you can configure the container to be centered
      center: true,

      // or have default horizontal padding
      padding: {
        DEFAULT: '1rem',
        xs:'1rem',
        sm: '2rem',
        lg: '1rem',
        xl: '1rem',
        '2xl': '1rem',
      },

      // default breakpoints but with 40px removed
      screens: {
        xs:'400px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      fontSize: {
        head: '30px',
        banhead: '3.5rem',
        parahead: '1rem',
        para:'0.875rem',
      },
      maxWidth: {
        '8xl': '1400px',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#FEF6F6',
        danger: '#f75454',
        bancolor:'#FEF7F7',
        textgray:'#7C6D65',
        texthead:'#161619',
        paracolor:'#7c6e65',
        textgray:'#beb4b4',
        border:'#eae8e4',
        inputbg:'#F6F5F3',
        bestdealbg:'#fff6f6',
        ...blackA,
        ...violet,
      },
      backgroundImage: {
        'banner': "url('./src/assets/banner/bgbanner.jpg')",
      }
    },
  },
  plugins: [],
}

