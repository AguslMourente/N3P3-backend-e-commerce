import { Router } from "express";
import { db } from "../db";
import { searchProducts } from "../search";

export const productsRouter = Router();

/** GET /search?q=...&offset=0&limit=10 */
productsRouter.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const offset = Number(req.query.offset ?? 0);
  const limit = Math.min(50, Number(req.query.limit ?? 10));
  const items = await searchProducts(q, offset, limit);
  res.json({ items, offset, limit });
});

/** GET /products/:id */
productsRouter.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
  if (!p) return res.status(404).json({ error: "not-found" });
  res.json({ id: p.id, title: p.title, price: p.price, stock: p.stock, ...JSON.parse(p.data_json ?? "{}") });
});
