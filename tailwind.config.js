/** @type {import('tailwindcss').Config} */
// const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./public/*.{js,css}",
    "./views/*.ejs",
    "./views/restaurant/*.ejs",
    "./views/errors/*.ejs",
    "./include/*.ejs",
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
}
