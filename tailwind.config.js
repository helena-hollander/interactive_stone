/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Klavika", "sans-serif"], light: ["Klavika-Light", "sans-serif"], 
      },
    
   },
   colors:{
    'primary-dark': '#34383E',
   },

  },
  plugins: [],
}