/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 由 App 的狀態控制，加上 .dark class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
