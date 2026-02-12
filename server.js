import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import fs from "node:fs";
import https from "node:https";
import http from "node:http";
import path from "node:path";

const minSubdomainCount = () => {
  if (process.env.NODE_ENV === "staging") {
    return 1;
  }
  return 0;
};

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const handler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
    : await import("./build/server/index.js"),
  getLoadContext: (req, res) => {
    const host = req.get("Host");
    const tenant =
      req.subdomains.length > minSubdomainCount()
        ? req.subdomains.pop()
        : undefined;
    const port = host.split(":").pop();
    const request = {
      protocol: req.protocol,
      host,
      subdomains: req.subdomains,
      port,
    };
    return { tenant, res, request };
  },
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/admin/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle SSR requests
app.all("*", handler);

const port = process.env.PORT || 4200;
const domain =
  process.env.NODE_ENV === "production" ? "dev.opentour.site" : "lvh.me";
const protocol = process.env.NODE_ENV === "production" ? "http" : "https";
const keyPath = process.env.SSL_KEY || path.resolve("./lvh.me-key.pem");
const certPath = process.env.SSL_CERT || path.resolve("./lvh.me.pem");

const startedMessage = () => {
  console.warn(
    `🚀 ${protocol.toUpperCase()} server running at ${protocol}://${domain}:${port} (pid: ${
      process.pid
    })`,
  );
  console.warn(
    `For local subdomains, use a fully qualified domain (e.g. ${protocol}://${domain}:${port}).`,
  );
};

// Start HTTPS server
if (protocol === "https") {
  const keyExists = fs.existsSync(keyPath);
  const certExists = fs.existsSync(certPath);
  if (!keyExists || !certExists) {
    throw new Error(
      "Missing certificate and/or key for SSL. Please see README for instructions.",
    );
  }
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(sslOptions, app).listen(port, "0.0.0.0", () => {
    startedMessage();
  });
} else {
  http.createServer({}, app).listen(port, "0.0.0.0", () => {
    startedMessage();

    if (process.env.NODE_ENV !== "production") {
      const separator = "*".repeat(process.stdout.columns);
      const warning =
        "Server is running on HTTP. You will not be able to get the device location for directions.\n\n" +
        "To run the server using HTTPS set the `PROTOCOL` environment variable to 'HTTPS'.\n\n" +
        "See the README for more information about adding local certs.";
      console.warn(`\n${separator}`);
      console.warn(warning);
      console.warn(separator);
    }
  });
}
