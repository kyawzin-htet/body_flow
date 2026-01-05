/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8",
        },
        secondary: {
          DEFAULT: "#f97316",
          dark: "#ea580c",
          light: "#fb923c",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        dark: {
          bg: "#0a0e27",
          surface: "#1a1f3a",
          border: "#2d3250",
        },
        light: {
          bg: "#f8f9fa",
          surface: "#ffffff",
          border: "#e5e7eb",
        },
      },
    },
  },
  plugins: [],
};
