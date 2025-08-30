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
        background: '#ebe7e1',
        foreground: '#1E1E1E',
        primary: {
          DEFAULT: '#6D3FC8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#1E1E1E',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F3F4F6',
          foreground: '#1E1E1E',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#ffffff',
        },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#6D3FC8',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['PT Sans', 'monospace'],
      },
    },
  },
  plugins: [],
}