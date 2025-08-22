import { Router } from "express";
import { authMiddleware } from "../auth";
import { db } from "../db";
import { createPaymentPreference } from "../payments";

export const ordersRouter = Router();

/** POST /order?productid=:id */
ordersRouter.post("/order", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const productId = Number(req.query.productid);
  if (!productId) return res.status(400).json({ error: "productid requerido" });

  const p = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as any;
  if (!p) return res.status(404).json({ error: "product-not-found" });
  if (p.stock <= 0) return res.status(400).json({ error: "out-of-stock" });

  const result = db.prepare("INSERT INTO orders (user_id, product_id, status) VALUES (?,?,?)")
    .run(userId, productId, "pending");
  const orderId = Number(result.lastInsertRowid);

  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
  const { preferenceId, initPoint } = await createPaymentPreference({
    orderId, title: p.title, quantity: 1, unit_price: p.price, payer_email: user.email
  });

  db.prepare("UPDATE orders SET mp_preference_id = ?, mp_init_point = ? WHERE id = ?")
    .run(preferenceId, initPoint, orderId);

  res.json({ orderId, payUrl: initPoint });
});

/** GET /me/orders */
ordersRouter.get("/me/orders", authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const rows = db.prepare(`
    SELECT o.id, o.status, o.created_at, p.title, p.price
    FROM orders o JOIN products p ON p.id = o.product_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId);
  res.json({ items: rows });
});

/** GET /order/:orderId */
ordersRouter.get("/order/:orderId", (req, res) => {
  const id = Number(req.params.orderId);
  const row = db.prepare(`
    SELECT o.*, p.title, p.price
    FROM orders o JOIN products p ON p.id = o.product_id
    WHERE o.id = ?
  `).get(id) as any;
  if (!row) return res.status(404).json({ error: "not-found" });
  res.json({
    id: row.id,
    status: row.status,
    product: { id: row.product_id, title: row.title, price: row.price },
    mp: { preferenceId: row.mp_preference_id, initPoint: row.mp_init_point },
    created_at: row.created_at,
    updated_at: row.updated_at
  });
});
