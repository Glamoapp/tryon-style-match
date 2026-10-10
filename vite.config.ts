import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from "@tailwindcss/vite"; // 👈 1. Added Tailwind plugin import

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    tailwindcss(), // 👈 2. Added Tailwind plugin execution
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"), // 👈 3. Fixed the __dirname warning
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
