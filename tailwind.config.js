/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fillup: {
          blue: '#139ED2',
          green: '#94CF53',
          overlay: '#00000040',
        },
      },
    },
  },
  plugins: [],
};
