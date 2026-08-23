import tailwindForms from '@tailwindcss/forms';
import tailwindContainerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#0a0a0a",
        "surface-container": "#111111",
        "surface-container-high": "#1a1a1a",
        "primary": "#10b981", /* Softer Emerald */
        "primary-container": "#059669",
        "on-primary": "#000000",
        "secondary": "#3b82f6", /* Blue Accent */
        "background": "#000000",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "display": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    tailwindForms,
    tailwindContainerQueries
  ],
}
