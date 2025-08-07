import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get settings for shop
router.get("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    let settings = await prisma.settings.findUnique({
      where: { shop },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: { shop },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.put("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;

    const settings = await prisma.settings.upsert({
      where: { shop },
      update: req.body,
      create: {
        ...req.body,
        shop,
      },
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
