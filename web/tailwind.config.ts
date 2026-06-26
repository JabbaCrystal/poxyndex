import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Now you see it" — a dark magician's stage with iridescent-disc accents.
        ink: "#0B0A12", // near-black indigo (stage)
        panel: "#15131F",
        cloud: "#ECEAF6", // primary text
        muted: "#9A93B4", // secondary text
        iris: {
          magenta: "#E26BFF",
          cyan: "#57E0FF",
          gold: "#FFD56B",
          violet: "#A57BFF",
          mint: "#7CFFB2",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
