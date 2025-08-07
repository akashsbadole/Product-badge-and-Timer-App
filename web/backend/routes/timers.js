import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all timers for shop
router.get("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const timers = await prisma.timer.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });
    res.json(timers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active timers for specific product
router.get("/product/:productId", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { productId } = req.params;
    const now = new Date();

    const timers = await prisma.timer.findMany({
      where: {
        shop,
        productId: productId.toString(),
        isActive: true,
        endDate: { gte: now },
      },
      orderBy: { endDate: "asc" },
    });
    res.json(timers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new timer
router.post("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const timer = await prisma.timer.create({
      data: {
        ...req.body,
        shop,
        productId: req.body.productId.toString(),
        variantId: req.body.variantId ? req.body.variantId.toString() : null,
        endDate: new Date(req.body.endDate),
      },
    });
    res.json(timer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update timer
router.put("/:id", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    const updateData = { ...req.body };
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const timer = await prisma.timer.update({
      where: {
        id,
        shop,
      },
      data: updateData,
    });
    res.json(timer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete timer
router.delete("/:id", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    await prisma.timer.delete({
      where: {
        id,
        shop,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations for timers
router.post("/bulk", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { action, ids } = req.body;

    switch (action) {
      case "delete":
        await prisma.timer.deleteMany({
          where: {
            id: { in: ids },
            shop,
          },
        });
        break;
      case "activate":
        await prisma.timer.updateMany({
          where: {
            id: { in: ids },
            shop,
          },
          data: { isActive: true },
        });
        break;
      case "deactivate":
        await prisma.timer.updateMany({
          where: {
            id: { in: ids },
            shop,
          },
          data: { isActive: false },
        });
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
