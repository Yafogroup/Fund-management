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
