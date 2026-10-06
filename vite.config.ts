import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      strategies: "injectManifest",

      srcDir: "src",
      filename: "sw.js",

      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
        type: "module",
      },

      includeAssets: [
        "favicon-16.png",
        "favicon-32.png",
        "icons/apple-touch-icon.png",
      ],

      manifest: {
        name: "Club100",
        short_name: "Club100",

        description:
          "Club100 Fitness - Know Your Fitness. Improve It. Measure the Progress.",

        theme_color: "#12395B",
        background_color: "#FFFFFF",

        display: "standalone",
        orientation: "portrait",

        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webmanifest}",
        ],
      },
    }),
  ],

  server: {
    allowedHosts: [
      "club100.local",
    ],

    proxy: {
      "/api": {
        target:
          "http://127.0.0.1:8000",

        changeOrigin: false,

        secure: false,

        headers: {
          Host:
            "club100.local",
        },
      },

      "/files": {
        target:
          "http://127.0.0.1:8000",

        changeOrigin: false,

        secure: false,

        headers: {
          Host:
            "club100.local",
        },
      },
    },
  },
});