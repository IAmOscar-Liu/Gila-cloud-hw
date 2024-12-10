/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"], // Set Arial as the default sans-serif font
      },
      colors: {
        primary: {
          DEFAULT: "rgba(60, 130, 246, 1)",
        },
        secondary: {
          light: "rgba(243, 244, 246, 1)",
          dark: "rgba(31, 41, 55, 1)",
          progressbar: "rgba(51, 61, 77 , 1)",
        },
        danger: {
          DEFAULT: "rgba(239, 68, 68, 1)",
        },
        highlight: {
          DEFAULT: "rgba(250, 204, 20, 1)",
          text: "rgba(253, 202, 0, 1)",
        },
      },
    },
  },
  plugins: [],
};
