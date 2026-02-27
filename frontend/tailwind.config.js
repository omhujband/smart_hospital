/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'os-dark': '#0a0e27',
        'os-blue': '#1e3a8a',
        'os-cyan': '#06b6d4',
        'os-neon': '#00d9ff',
        'os-glass': 'rgba(30, 58, 138, 0.1)',
        'os-success': '#10b981',
        'os-warning': '#f59e0b',
        'os-error': '#ef4444',
        'os-info': '#8b5cf6',
        'os-border-glow': 'rgba(0, 217, 255, 0.3)',
        'os-hover': 'rgba(6, 182, 212, 0.2)',
        'os-shadow-glow': 'rgba(0, 217, 255, 0.6)',
      },
      backdropBlur: {
        'os': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
