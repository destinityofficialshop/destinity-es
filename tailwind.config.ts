import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fcfbf8',
          100: '#f8f5ee',
          200: '#efe6d5',
          300: '#e3d2b4',
          400: '#cfae7d',
          500: '#b89053', // Champagne luxury gold
          600: '#9e7542',
          700: '#805a36',
          800: '#694a31',
          900: '#563e2c',
          950: '#302014',
        },
        obsidian: {
          50: '#f6f7f9',
          100: '#edeef2',
          200: '#d7dae2',
          300: '#b4bacb',
          400: '#8c95af',
          500: '#6f7896',
          600: '#58607c',
          700: '#474d64',
          800: '#1b1d22',
          900: '#121418', // Deep luxury dark
          950: '#0a0b0d', // Pitch black-grey
        },
      },
      fontFamily: {
        heading: ["var(--font-syne)", "Syne", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
