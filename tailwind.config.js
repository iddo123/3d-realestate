/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Madlan-style palette
        teal: {
          DEFAULT: "#15c0a3",
          50: "#e9fbf6",
          100: "#c9f5ea",
          400: "#2dd4bb",
          500: "#15c0a3",
          600: "#0fa78d",
          700: "#0c8572",
        },
        ink: {
          DEFAULT: "#1b2733",
          soft: "#46586b",
          faint: "#8597a8",
        },
        cream: "#f5f7f8",
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 18px rgba(27, 39, 51, 0.08)",
        cardHover: "0 10px 30px rgba(27, 39, 51, 0.16)",
        search: "0 12px 40px rgba(0, 0, 0, 0.18)",
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
