import { Router } from "express";
import { db } from "../db";

export const mpRouter = Router();

/** Webhook MP (simplificado) POST /mp/mercadopago */
mpRouter.post("/mercadopago", async (req, res) => {
  try {
    const body = req.body ?? {};
    const ext = String(body.external_reference ?? "");
    const status = String(body.status ?? "");
    const orderId = ext ? Number(ext) : null;

    if (orderId && status === "approved") {
      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
      if (row && row.status !== "paid") {
        db.prepare("UPDATE orders SET status = 'paid', updated_at = datetime('now') WHERE id = ?").run(orderId);
        db.prepare("UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0").run(row.product_id);
      }
    }
    res.json({ ok: true });
  } catch {
    res.status(200).json({ ok: true });
  }
});
