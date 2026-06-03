/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: 'var(--cyber-bg)',
          card: 'var(--cyber-card)',
          border: 'var(--cyber-border)',
          'border-focus': 'var(--cyber-border-focus)',
          purple: 'var(--cyber-purple)',
          blue: 'var(--cyber-blue)',
          green: 'var(--cyber-green)',
          pink: 'var(--cyber-pink)',
          cyan: 'var(--cyber-cyan)',
          yellow: 'var(--cyber-yellow)',
          red: 'var(--cyber-red)',
          orange: 'var(--cyber-orange)',
          text: 'var(--cyber-text)',
          muted: 'var(--cyber-muted)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 12px 0 rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.4)',
        'neon-blue': '0 0 15px rgba(59, 82, 246, 0.4)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'neon-pink': '0 0 15px rgba(236, 72, 153, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        lg: '24px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(139, 92, 246, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.6), 0 0 25px rgba(139, 92, 246, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
