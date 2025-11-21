/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // "Montserrat" pour les titres (Extra Bold demandé)
        montserrat: ['Montserrat', 'sans-serif'],
        // "Times New Roman" pour le corps du texte
        times: ['"Times New Roman"', 'Times', 'serif'],
        // Garder sans par défaut au cas où, mais on surchargera body
        sans: ['"Times New Roman"', 'Times', 'serif'], 
      },
    },
  },
  plugins: [],
}