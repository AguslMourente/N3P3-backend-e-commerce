import { Router } from "express";
import { createAndSendLoginCode, exchangeCodeForToken } from "../auth";

export const authRouter = Router();

/** POST /auth -> { email } */
authRouter.post("/", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email requerido" });
  await createAndSendLoginCode(email);
  res.json({ ok: true });
});

/** POST /auth/token -> { email, code } */
authRouter.post("/token", (req, res) => {
  const { email, code } = req.body ?? {};
  if (!email || !code) return res.status(400).json({ error: "email y code requeridos" });
  try {
    const { token } = exchangeCodeForToken(email, code);
    res.json({ token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
