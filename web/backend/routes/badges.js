import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all badges for shop
router.get("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const badges = await prisma.badge.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get badges for specific product
router.get("/product/:productId", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { productId } = req.params;

    const badges = await prisma.badge.findMany({
      where: {
        shop,
        productId: productId.toString(),
        isActive: true,
      },
      orderBy: { priority: "desc" },
    });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new badge
router.post("/", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const badge = await prisma.badge.create({
      data: {
        ...req.body,
        shop,
        productId: req.body.productId.toString(),
        variantId: req.body.variantId ? req.body.variantId.toString() : null,
      },
    });
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update badge
router.put("/:id", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    const badge = await prisma.badge.update({
      where: {
        id,
        shop,
      },
      data: req.body,
    });
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete badge
router.delete("/:id", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    await prisma.badge.delete({
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

// Bulk operations
router.post("/bulk", async (req, res) => {
  try {
    const { shop } = res.locals.shopify.session;
    const { action, ids, data } = req.body;

    switch (action) {
      case "delete":
        await prisma.badge.deleteMany({
          where: {
            id: { in: ids },
            shop,
          },
        });
        break;
      case "activate":
        await prisma.badge.updateMany({
          where: {
            id: { in: ids },
            shop,
          },
          data: { isActive: true },
        });
        break;
      case "deactivate":
        await prisma.badge.updateMany({
          where: {
            id: { in: ids },
            shop,
          },
          data: { isActive: false },
        });
        break;
      default:
        throw new Error("Invalid bulk action");
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
