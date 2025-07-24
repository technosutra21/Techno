/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberpunk: {
          pink: '#ff0080',
          cyan: '#00ffff',
          purple: '#8000ff',
          green: '#39ff14',
          yellow: '#ffff00',
          dark: '#0a0a0f',
          darker: '#050507',
        },
        neon: {
          blue: '#00d4ff',
          pink: '#ff006e',
          green: '#39ff14',
          purple: '#bf00ff',
          yellow: '#fff700',
        }
      },
      fontFamily: {
        'cyber': ['Orbitron', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-neon': 'pulse-neon 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          'from': { textShadow: '0 0 20px #fff, 0 0 30px #fff, 0 0 40px #00ffff' },
          'to': { textShadow: '0 0 30px #fff, 0 0 40px #00ffff, 0 0 50px #00ffff' }
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '50%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a0033 50%, #000a1a 100%)',
        'neon-gradient': 'linear-gradient(45deg, #ff006e, #00d4ff, #39ff14, #fff700)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      }
    },
  },
  plugins: [],
}