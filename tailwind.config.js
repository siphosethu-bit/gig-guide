/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter","system-ui","sans-serif"],
      },
      boxShadow: {
        poster: "0 10px 30px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
}
