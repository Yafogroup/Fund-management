// tailwind.config.js
import withMT from "@material-tailwind/react/utils/withMT";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#060e15",
        lBLue: "#45beef",
        lGreen: "#19951c"
      },
    },
    fontFamily: {
      sans: ['Helvetica', ...defaultTheme.fontFamily.sans],
      helvetica: ['Helvetica', 'Arial', 'sans-serif'], // optional custom key
    },
  },
  plugins: [],
});
