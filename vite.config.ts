import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Club100",
        short_name: "Club100",
        description: "Club100 Fitness Member App",
        theme_color: "#12395B",
        background_color: "#FFFFFF",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
    }),
  ],
});