/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        primary: "#007A7C",
        secondary: "#F8FAFB",
        tertiary: "#102A43",
        neutral: "#627D98",
        accent: "#007A7C",
        "accent-light": "rgba(0, 122, 124, 0.1)",
        "accent-border": "rgba(0, 122, 124, 0.5)",
        // Backwards compatibility for old "event-" names
        "event-navy": "#102A43",
        "event-white": "#F8FAFB",
        "event-charcoal": "#102A43",
        "event-red": "#007A7C",
        "event-gray": "#627D98",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Manrope", "sans-serif"],
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        bounce: "bounce 3s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
