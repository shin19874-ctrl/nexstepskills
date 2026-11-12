export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Sora', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { 900: '#0A1F44', 800: '#0F2D5E', 700: '#163B78' },
        ocean: { 50: '#effaff', 100: '#dcf3ff', 200: '#b3e8ff', 300: '#7cd8ff', 400: '#36c2f5', 500: '#0ea5d9', 600: '#0b7fb8', 700: '#0b6494', 800: '#0c4f76' },
        aqua: { 400: '#2dd4c4', 500: '#14b8a6' }
      }
    }
  }
}
