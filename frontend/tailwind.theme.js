// tailwind.theme.js

module.exports = {
  theme: {
    extend: {
      colors: {
        // Signature Colors
        primary: {
          DEFAULT: '#16A34A', // Primary Green
          dark: '#15803D',    // Primary Green Dark (hover, active)
        },
        // Neutral Palette
        gray: {
          100: '#F3F4F6', // Light background
          200: '#E5E7EB', // Divider, subtle surface
          400: '#9CA3AF', // Dark theme secondary text
          600: '#4B5563', // Secondary text
          700: '#374151', // Dark theme divider
          800: '#1F2937', // Dark theme surface
          900: '#111827', // Main text, dark background
        },
        white: '#FFFFFF', // Card/surface for light theme
        // System Colors
        error: {
          DEFAULT: '#DC2626', // Error Red
        },
        warning: {
          DEFAULT: '#D97706', // Warning Amber
        },
        info: {
          DEFAULT: '#2563EB', // Info Blue
        },
        // Theme Groups
        light: {
          background: '#F3F4F6', // Gray-100
          surface: '#FFFFFF',    // White
          heading: '#111827',    // Gray-900
          subheading: '#4B5563', // Gray-600
          primary: '#16A34A',    // Primary Green
          divider: '#E5E7EB',    // Gray-200
        },
        dark: {
          background: '#111827', // Gray-900
          surface: '#1F2937',    // Gray-800
          heading: '#F3F4F6',    // Gray-100
          subheading: '#9CA3AF', // Gray-400
          primary: '#16A34A',    // Primary Green
          divider: '#374151',    // Gray-700
        },
      },
    },
  },
};
