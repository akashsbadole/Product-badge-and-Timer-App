import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";

const prisma = new PrismaClient();

export const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: {
      "Product Enhancer Pro": {
        lineItems: [
          {
            plan: "Product Enhancer Pro",
            interval: BillingInterval.Every30Days,
            amount: free,
            currencyCode: "USD",
          },
        ],
      },
    },
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

export default shopify;
