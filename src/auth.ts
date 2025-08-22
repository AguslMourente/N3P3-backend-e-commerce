import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config";
import { db } from "./db";
import { addMinutes, nowSec, randomCode } from "./utils";
import { sendLoginCode } from "./email";
import type { Request, Response, NextFunction } from "express";

export type MyJWTPayload = JwtPayload & { sub: number };

export function signToken(userId: number) {
  return jwt.sign({ sub: userId } as MyJWTPayload, config.jwtSecret, { expiresIn: "7d" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "token requerido" });

  try {
    const payload = jwt.verify(token, config.jwtSecret) as MyJWTPayload;
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "token inválido" });
  }
}

export async function createAndSendLoginCode(email: string) {
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) db.prepare("INSERT INTO users (email) VALUES (?)").run(email);

  const code = randomCode(6);
  db.prepare("INSERT INTO login_codes (email, code, expires_at) VALUES (?,?,?)")
    .run(email, code, addMinutes(10));

  await sendLoginCode(email, code);
}

export function exchangeCodeForToken(email: string, code: string) {
  const row = db.prepare(
    `SELECT * FROM login_codes
     WHERE email = ? AND code = ? AND used = 0
     ORDER BY id DESC LIMIT 1`
  ).get(email, code) as any;

  if (!row) throw new Error("code-not-found");
  if (row.expires_at < nowSec()) throw new Error("code-expired");

  db.prepare("UPDATE login_codes SET used = 1 WHERE id = ?").run(row.id);

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  const token = signToken(user.id);
  return { token, userId: user.id };
}
