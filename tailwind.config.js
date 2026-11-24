/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#050810',
          900: '#0a0f1e',
          850: '#0e1428',
          800: '#131a30',
          700: '#1c2542',
          600: '#2a3556',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-emerald': '0 0 24px rgba(16, 185, 129, 0.25)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'fade-up': 'fadeUp 0.45s ease-out both',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
