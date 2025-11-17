import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  // Caminhos relativos (funciona bem no Pages)
  base: "./",

  // 👇 manda o build pra pasta docs
  build: {
    outDir: "docs",
  },

  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
