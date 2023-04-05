/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px'
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // ...
  ],
};
