/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zombie Theme - Dark, Undead Aesthetic
        zombie: {
          // Base zombie flesh tones
          flesh: {
            50: '#8B9B7E',
            100: '#7A8A6D',
            200: '#6A7A5D',
            300: '#5A6A4D',
            400: '#4A5A3D',
            500: '#3A4A2D', // Main zombie green
            600: '#2A3A1D',
            700: '#1A2A0D',
            800: '#151F0A',
            900: '#0F1506',
          },

          // Rot and decay colors
          rot: {
            50: '#4A3F35',
            100: '#3F352A',
            200: '#352A20',
            300: '#2A2015',
            400: '#20150A',
            500: '#1A1108', // Deep rot brown
            600: '#150C06',
            700: '#100904',
            800: '#0A0502',
            900: '#050301',
          },

          // Blood colors
          blood: {
            50: '#8B1F1F',
            100: '#7A1515',
            200: '#6A0E0E',
            300: '#5A0808',
            400: '#4A0505',
            500: '#3A0303', // Dark blood red
            600: '#2A0202',
            700: '#1A0101',
            800: '#150101',
            900: '#0F0000',
          },

          // Toxic/poison greens
          toxic: {
            50: '#9FFF9F',
            100: '#7FFF7F',
            200: '#5FEF5F',
            300: '#3FDF3F',
            400: '#2FCF2F',
            500: '#1FBF1F', // Bright toxic green
            600: '#1FAF1F',
            700: '#1F9F1F',
            800: '#1F8F1F',
            900: '#1F7F1F',
          },
        },

        // Dark theme base colors
        dark: {
          bg: '#0F0F0F',        // Almost black background
          surface: '#1A1A1A',   // Slightly lighter surface
          panel: '#242424',     // Panel background
          border: '#333333',    // Border color
          hover: '#2A2A2A',     // Hover state
          text: '#E5E5E5',      // Main text
          textDim: '#999999',   // Dimmed text
        },

        // Necromantic purple/dark magic
        necro: {
          50: '#A78BFA',
          100: '#9F7AEA',
          200: '#8B5CF6',
          300: '#7C3AED',
          400: '#6D28D9',
          500: '#5B21B6', // Main necro purple
          600: '#4C1D95',
          700: '#3B1474',
          800: '#2E1065',
          900: '#1E0A4F',
        },

        // Soul essence (ethereal blue-white)
        soul: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Main soul blue
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
      },

      fontFamily: {
        // Pixel-art style fonts (placeholder - will be replaced with actual fonts)
        pixel: ['"Press Start 2P"', 'monospace'],
        game: ['"VT323"', 'monospace'],
        header: ['"Creepster"', 'cursive'],
      },

      animation: {
        // Custom animations for game
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'decay': 'decay 10s linear forwards',
      },

      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(31, 191, 31, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(31, 191, 31, 0.8)' },
        },
        decay: {
          '0%': { filter: 'grayscale(0%) brightness(100%)' },
          '100%': { filter: 'grayscale(80%) brightness(60%)' },
        },
      },

      boxShadow: {
        'glow-green': '0 0 10px rgba(31, 191, 31, 0.5)',
        'glow-red': '0 0 10px rgba(58, 3, 3, 0.5)',
        'glow-purple': '0 0 10px rgba(91, 33, 182, 0.5)',
        'glow-blue': '0 0 10px rgba(14, 165, 233, 0.5)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
