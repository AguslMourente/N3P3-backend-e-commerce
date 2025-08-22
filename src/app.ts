import express from "express";
// @ts-ignore: si falta @types/cors, ignoramos el warning de tipos
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { meRouter } from "./routes/me.routes";
import { productsRouter } from "./routes/products.routes";
import { ordersRouter } from "./routes/orders.routes";
import { mpRouter } from "./routes/mp.routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/", productsRouter);
app.use("/", ordersRouter);
app.use("/mp", mpRouter);

app.get("/", (_req, res) => res.json({ ok: true, service: "ecommerce-backend" }));
