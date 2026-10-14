import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";
import type { Plugin, UserConfig } from "vite";

function maplibreWorkerPlugin(): Plugin {
  const distDir = path.resolve("node_modules/maplibre-gl/dist");
  return {
    name: "maplibre-worker",
    apply: "build",
    generateBundle() {
      for (const name of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
        this.emitFile({
          type: "asset",
          fileName: `assets/${name}`,
          source: fs.readFileSync(path.join(distDir, name), "utf-8"),
        });
      }
    },
  };
}

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");

  let httpsOptions = {};

  if (env.NODE_ENV !== "production") {
    httpsOptions = {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "./lvh.me-key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "./lvh.me.pem")),
      },
      strictPort: true,
      hmr: {
        protocol: "wss",
      },
    };
  }
  return {
    base: process.env.NODE_ENV === "production" ? "/admin/" : "/",
    build: {
      outDir: "build/admin",
    },
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      maplibreWorkerPlugin(),
    ],
    optimizeDeps: { exclude: ["maplibre-gl"] },
    ssr: {
      noExternal: ["jodit-react", "jodit"],
    },
    server: {
      allowedHosts: ["lvh.me", "opentour.site", "dev.opentour.site"],
      ...httpsOptions,
    },
  };
});
