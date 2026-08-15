/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-color": "var(--background-color)",
        "neutral-color": "var(--neutral-color)",
        "txt-color": "var(--text-color)",
        "btn-color": "var(--interaction-color)",
        "sec-color": "var(--secondary-color)",
        "alert-color": "var(--alert)",
      },
    },
  },
  plugins: [],
};
