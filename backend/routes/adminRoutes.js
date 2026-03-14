const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Truncate all tables (FK-safe order: items → orders → products → users)
router.post("/truncate/all", async (req, res) => {
  await db.query("TRUNCATE TABLE order_items, orders, products, users RESTART IDENTITY CASCADE");
  res.json({ message: "All tables truncated successfully" });
});

// Truncate individual tables
router.post("/truncate/orders", async (req, res) => {
  await db.query("TRUNCATE TABLE order_items, orders RESTART IDENTITY CASCADE");
  res.json({ message: "Orders and order_items truncated successfully" });
});

router.post("/truncate/products", async (req, res) => {
  await db.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
  res.json({ message: "Products table truncated successfully" });
});

router.post("/truncate/users", async (req, res) => {
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  res.json({ message: "Users table truncated successfully" });
});

module.exports = router;
