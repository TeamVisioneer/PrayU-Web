/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      letterSpacing: {
        tightest: "-0.05em",
      },
      boxShadow: {
        button: "0 10px 10px rgba(188, 190, 208, 0.8)",
        member: "0 7px 7px rgba(193, 198, 246, 0.25)",
        prayCard: "0 10px 10px rgba(193, 198, 246, 0.25)",
      },
      colors: {
        mainBg: "#F2F3FD",
        mainBtn: "#70AAFF",
        black: "#020202",
        liteBlack: "#4A4A4A",
        dark: "#6A6A6A",
        deactivate: "#BFBFBF",
        liteRed: "#EE7470",
        prayCardStart: "#B7DFFF",
        prayCardMiddle: "#F3E5FF",
        prayCardMiddle2: "#F9E9F5",
        start: "#73ABFF",
        middle: "#CFBFFF",
        end: "#FFD7C9",
        grayText: "#4A4A4A",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in": "slide-in 0.4s ease-out forwards",
        flip: "flip 0.7s ease-out forwards",
      },
      animationDelay: {
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
      },
      height: {
        "5vh": "calc(var(--vh) * 5)",
        "10vh": "calc(var(--vh) * 10)",
        "15vh": "calc(var(--vh) * 15)",
        "20vh": "calc(var(--vh) * 20)",
        "25vh": "calc(var(--vh) * 25)",
        "30vh": "calc(var(--vh) * 30)",
        "35vh": "calc(var(--vh) * 35)",
        "40vh": "calc(var(--vh) * 40)",
        "45vh": "calc(var(--vh) * 45)",
        "50vh": "calc(var(--vh) * 50)",
        "55vh": "calc(var(--vh) * 55)",
        "60vh": "calc(var(--vh) * 60)",
        "65vh": "calc(var(--vh) * 65)",
        "70vh": "calc(var(--vh) * 70)",
        "75vh": "calc(var(--vh) * 75)",
        "80vh": "calc(var(--vh) * 80)",
        "85vh": "calc(var(--vh) * 85)",
        "90vh": "calc(var(--vh) * 90)",
        "95vh": "calc(var(--vh) * 95)",
        "100vh": "calc(var(--vh) * 100)",
      },
      maxHeight: {
        "5vh": "calc(var(--vh) * 5)",
        "10vh": "calc(var(--vh) * 10)",
        "15vh": "calc(var(--vh) * 15)",
        "20vh": "calc(var(--vh) * 20)",
        "25vh": "calc(var(--vh) * 25)",
        "30vh": "calc(var(--vh) * 30)",
        "35vh": "calc(var(--vh) * 35)",
        "40vh": "calc(var(--vh) * 40)",
        "45vh": "calc(var(--vh) * 45)",
        "50vh": "calc(var(--vh) * 50)",
        "55vh": "calc(var(--vh) * 55)",
        "60vh": "calc(var(--vh) * 60)",
        "65vh": "calc(var(--vh) * 65)",
        "70vh": "calc(var(--vh) * 70)",
        "75vh": "calc(var(--vh) * 75)",
        "80vh": "calc(var(--vh) * 80)",
        "85vh": "calc(var(--vh) * 85)",
        "90vh": "calc(var(--vh) * 90)",
        "95vh": "calc(var(--vh) * 95)",
        "100vh": "calc(var(--vh) * 100)",
      },
      minHeight: {
        "5vh": "calc(var(--vh) * 5)",
        "10vh": "calc(var(--vh) * 10)",
        "15vh": "calc(var(--vh) * 15)",
        "20vh": "calc(var(--vh) * 20)",
        "25vh": "calc(var(--vh) * 25)",
        "30vh": "calc(var(--vh) * 30)",
        "35vh": "calc(var(--vh) * 35)",
        "40vh": "calc(var(--vh) * 40)",
        "45vh": "calc(var(--vh) * 45)",
        "50vh": "calc(var(--vh) * 50)",
        "55vh": "calc(var(--vh) * 55)",
        "60vh": "calc(var(--vh) * 60)",
        "65vh": "calc(var(--vh) * 65)",
        "70vh": "calc(var(--vh) * 70)",
        "75vh": "calc(var(--vh) * 75)",
        "80vh": "calc(var(--vh) * 80)",
        "85vh": "calc(var(--vh) * 85)",
        "90vh": "calc(var(--vh) * 90)",
        "95vh": "calc(var(--vh) * 95)",
        "100vh": "calc(var(--vh) * 100)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".delay-200": {
          "animation-delay": "200ms",
        },
        ".delay-300": {
          "animation-delay": "300ms",
        },
        ".delay-400": {
          "animation-delay": "400ms",
        },
        ".delay-500": {
          "animation-delay": "500ms",
        },
        ".perspective-1000": {
          perspective: "1000px",
        },
        ".transform-style-3d": {
          "transform-style": "preserve-3d",
        },
        ".backface-hidden": {
          "backface-visibility": "hidden",
        },
        ".rotate-y-180": {
          transform: "rotateY(180deg)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
