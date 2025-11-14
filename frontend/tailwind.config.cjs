// tailwind.config.js
import withMT from "@material-tailwind/react/utils/withMT";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cDark: "#040717",
        lBLue: "#45beef",
        lBLue1: "#44e6f9",
        lGreen: "#19951c",
        sidebar: "#0d1726",
        cBlue: "#23b0c1",
        cBlue1: "#0783d5",
        cBlue2: "#244474",
        cBlue3: "#18263c",
        cPink: "#7837c1"
      },
    },
    fontFamily: {
      sans: ['Segoe UI', 'Arial', 'sans-serif'],
    },
  },
  plugins: [
    plugin(({ addBase, theme }) => {
      addBase({
        '.scrollbar': {
          overflowY: 'auto',
          scrollbarColor: `${theme('colors.blue.600')} ${theme('colors.blue.200')}`,
          scrollbarWidth: 'thin',
        },
        '.scrollbar::-webkit-scrollbar': {
          height: '2px',
          width: '2px',
        },
        '.scrollbar::-webkit-scrollbar-thumb': {
          backgroundColor: theme('colors.blue.600'),
        },
        '.scrollbar::-webkit-scrollbar-track-piece': {
          backgroundColor: theme('colors.blue.200'),
        },
      });
    }),
  ],
});
