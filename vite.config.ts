import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "C:/tmp/controlled-genui-vite-cache",
  plugins: [react()]
});
