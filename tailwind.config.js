/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        darkteal: "#497174",
        offwhite: "#eff5f5",
        aqua: "#d6e4e5",
        iceblue: "#eeeff2",
        orange: "#fd5108",
      },
    },
  },
  plugins: [],
};
