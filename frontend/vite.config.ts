import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/login": "http://127.0.0.1:5000",
      "/register-client": "http://127.0.0.1:5000",
      "/verify-client": "http://127.0.0.1:5000",
      "/calculate-dose": "http://127.0.0.1:5000",
      "/upload-vcf": "http://127.0.0.1:5000",
      "/predict-warfarin": "http://127.0.0.1:5000"
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));

