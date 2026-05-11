/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#5478ff",
          500: "#2d4eff",
          600: "#1a30f5",
          900: "#181e8e",
        },
        radar: {
          green: "#00ff88",
          dark: "#0a0a1a",
          card: "#12122a",
        },
      },
    },
  },
  plugins: [],
};
