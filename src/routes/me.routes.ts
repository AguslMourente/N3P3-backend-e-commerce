import { Router } from "express";
import { authMiddleware } from "../auth";
import { db } from "../db";

export const meRouter = Router();

meRouter.get("/", authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const u = db.prepare("SELECT id,email,name,address_json FROM users WHERE id = ?").get(userId) as any;
  res.json({
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    address: u.address_json ? JSON.parse(u.address_json) : null
  });
});

meRouter.patch("/", authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const { name } = req.body ?? {};
  if (typeof name !== "string") return res.status(400).json({ error: "name inválido" });
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
  res.json({ ok: true });
});

meRouter.patch("/address", authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const address = req.body ?? {};
  db.prepare("UPDATE users SET address_json = ? WHERE id = ?").run(JSON.stringify(address), userId);
  res.json({ ok: true });
});
