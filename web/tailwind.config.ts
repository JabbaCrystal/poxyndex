import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Economist-ish palette
        poxy: {
          red: "#E3120B",
          ink: "#121212",
          paper: "#FBF7F0",
          card: "#FFFFFF",
          muted: "#6B6B6B",
          line: "#E3DCCD",
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
