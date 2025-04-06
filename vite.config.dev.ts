import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import type { VitePWAOptions } from "vite-plugin-pwa";

export const devServiceWorkerConfig: Partial<VitePWAOptions> = {
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.ts",
  registerType: "autoUpdate",
  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
  },
  injectManifest: {
    injectionPoint: undefined,
    rollupFormat: "es",
    maximumFileSizeToCacheInBytes: 3000000,
  },
  manifest: {
    name: "TokenForge",
    short_name: "TokenForge",
    theme_color: "#7b3fe4",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};
