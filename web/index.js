import express from "express";
import { join } from "path";
import { readFileSync } from "fs";
import cors from "cors";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";

// Import routes
import badgeRoutes from "./backend/routes/badges.js";
import timerRoutes from "./backend/routes/timers.js";
import settingsRoutes from "./backend/routes/settings.js";

const prisma = new PrismaClient();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10) || 3000;

const app = express();

// Configure Shopify app
const shopify = shopifyApp({
  api: {
    apiVersion: "2023-10",
    restResources,
    billing: undefined,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new PrismaSessionStorage(prisma),
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(shopify.config.auth.path, shopify.auth.begin());
app.use(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.use(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

// API Routes
app.use("/api/badges", shopify.validateAuthenticatedSession(), badgeRoutes);
app.use("/api/timers", shopify.validateAuthenticatedSession(), timerRoutes);
app.use(
  "/api/settings",
  shopify.validateAuthenticatedSession(),
  settingsRoutes
);

// GraphQL endpoint
app.use(
  "/api/graphql",
  shopify.validateAuthenticatedSession(),
  async (req, res) => {
    const response = await shopify.clients.graphQL({
      session: res.locals.shopify.session,
      query: req.body.query || req.query.query,
      variables: req.body.variables,
    });
    res.json(response);
  }
);

// Serve frontend
app.use(shopify.cspHeaders());
app.use(express.static(join(process.cwd(), "frontend/dist")));

app.get("/*", shopify.ensureInstalledOnShop(), async (req, res) => {
  res.set("Content-Type", "text/html");
  const htmlFile = join(process.cwd(), "frontend/dist", "index.html");
  res.send(readFileSync(htmlFile, "utf8"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
