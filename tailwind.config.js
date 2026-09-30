/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Coffee & Cream Palette from user swatch (media_1790777562845.png)
        cream: "#f5edeb",
        caramel: "#dab38c",
        amber: "#e3a157",
        mocha: "#b2652f",
        espresso: "#5d3a24",
        roast: "#29100b",
        ocean: {
          50: "#F0F9FE",
          100: "#CDEEFC",
          200: "#90DAFA",
          300: "#42C1F7",
          400: "#00AFEF",
          500: "#00A1DB",
          600: "#0088B7",
          700: "#00759C",
          800: "#006283",
          900: "#004A63",
          950: "#002E3D",
        },
        sun: {
          50: "#FFFDEB",
          100: "#FFFAC2",
          200: "#FFF585",
          300: "#FFDE59", // Official Bhoomiputra lemon yellow
          400: "#FACC15",
          500: "#EAB308",
        },
        ink: {
          900: "#111111",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        tactile:
          "0 2px 0 0 rgba(0, 74, 99, 0.08), 0 10px 25px -5px rgba(0, 74, 99, 0.05)",
        "tactile-hover":
          "0 4px 0 0 rgba(0, 74, 99, 0.12), 0 20px 30px -10px rgba(0, 74, 99, 0.12)",
        modal: "0 25px 50px -12px rgba(0, 74, 99, 0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
