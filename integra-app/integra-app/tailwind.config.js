/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

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
        surface: {
          DEFAULT: c("--surface"),
          raised: c("--surface-raised"),
          sunken: c("--surface-sunken"),
          inverse: c("--surface-inverse"),
        },
        content: {
          DEFAULT: c("--content"),
          muted: c("--content-muted"),
          subtle: c("--content-subtle"),
          disabled: c("--content-disabled"),
          inverse: c("--content-inverse"),
          "on-primary": c("--content-on-primary"),
        },
        line: {
          DEFAULT: c("--border"),
          strong: c("--border-strong"),
          focus: c("--border-focus"),
        },
        primary: {
          DEFAULT: c("--primary"),
          pressed: c("--primary-pressed"),
          subtle: c("--primary-subtle"),
          "on-subtle": c("--primary-on-subtle"),
        },
        success: {
          DEFAULT: c("--success"),
          subtle: c("--success-subtle"),
          "on-subtle": c("--success-on-subtle"),
        },
        warning: {
          DEFAULT: c("--warning"),
          subtle: c("--warning-subtle"),
          "on-subtle": c("--warning-on-subtle"),
        },
        danger: {
          DEFAULT: c("--danger"),
          solid: c("--danger-solid"),
          subtle: c("--danger-subtle"),
          "on-subtle": c("--danger-on-subtle"),
        },

        // legacy
        // legacy
        "bg-color": c("--background-color"),
        "neutral-color": c("--neutral-color"),
        "txt-color": c("--text-color"),
        "btn-color": c("--interaction-color"),
        "sec-color": c("--secondary-color"),
        "alert-color": c("--alert"),
      },
      fontSize: {
        display: ["30px", { lineHeight: "36px" }],
        title: ["24px", { lineHeight: "30px" }],
        heading: ["20px", { lineHeight: "26px" }],
        subheading: ["17px", { lineHeight: "24px" }],
        body: ["16px", { lineHeight: "24px" }],
        label: ["15px", { lineHeight: "20px" }],
        caption: ["14px", { lineHeight: "20px" }],
        "large-title": ["34px", { lineHeight: "41px" }],
      },

      borderRadius: {
        chip: "6px",
        control: "10px",
        card: "14px",
        sheet: "20px",
      },
    },
  },
  plugins: [],
};
