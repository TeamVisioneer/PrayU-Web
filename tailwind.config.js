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
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      userSelect: {
        text: "text",
      },
      boxShadow: {
        button: "0 10px 10px rgba(188, 190, 208, 0.8)",
        // custom
        member: "0 7px 7px rgba(193, 198, 246, 0.25)",
        prayCard: "0 10px 10px rgba(193, 198, 246, 0.25)",
        // custom
      },
      colors: {
        // custom
        mainBg: "#F2F3FD",
        mainBtn: "#70AAFF",

        black: "#020202",
        dark: "#6A6A6A",
        deactivate: "#BFBFBF",
        // custom

        prayCardStart: "#B7DFFF",
        prayCardMiddle: "#F3E5FF",
        prayCardMiddle2: "#F9E9F5",
        start: "#4B93FF",
        middle: "#B095FF",
        end: "#FFC7B4",
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
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      height: {
        "10vh": "10vh",
        "15vh": "15vh",
        "20vh": "20vh",
        "30vh": "30vh",
        "40vh": "40vh",
        "50vh": "50vh",
        "55vh": "55vh",
        "60vh": "60vh",
        "70vh": "70vh",
        "80vh": "80vh",
        "90vh": "90vh",
        "100vh": "100vh",
      },
    },
  },
  variants: {
    extend: {
      userSelect: ["responsive", "hover", "focus"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
