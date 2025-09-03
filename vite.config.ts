import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      jsxImportSource: "react",
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance - critical for preventing null hook errors
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
    },
    dedupe: ["react", "react-dom"],
  },
  define: {
    __DEV__: mode === 'development',
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true, // Force re-optimization to ensure single React instance
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
}));
