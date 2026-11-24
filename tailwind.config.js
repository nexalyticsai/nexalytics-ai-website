/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brandDark: '#044051',
        brandDarker: '#02242e',
        brandSurface: '#064d60',
        brandOrange: '#ff5900',
        brandOrangeHover: '#e04e00',
        brandGreen: '#00b870',
        brandGreenHover: '#009e60',
        brandNeon: '#00ffaa',
        brandCyan: '#00e5ff',
        brandMint: '#daf9ed'
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Source Sans 3"', 'sans-serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
