import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { config } from "./lib/config.js";
import { rateLimiter } from "./middleware/rate-limit.js";
import { errorHandler } from "./middleware/error-handler.js";
import { health } from "./routes/health.js";
import { define } from "./routes/define.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());
app.use("/api/*", rateLimiter);

app.route("/api/health", health);
app.route("/api/define", define);

app.onError(errorHandler);

serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`Contexte listening at http://localhost:${config.port}`);
});
