import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";
import path from "path";

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
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    ssr: {
      noExternal: ["jodit-react", "jodit", "@googlemaps/js-api-loader"],
    },
    server: {
      allowedHosts: ["lvh.me", "opentour.site", "dev.opentour.site"],
      ...httpsOptions,
    },
  };
});
