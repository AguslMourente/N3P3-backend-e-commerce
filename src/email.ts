// archivo sin errores de tipos aunque no tengas @types/nodemailer
// (si luego querés tipado estricto, te doy la opción más abajo)

// @ts-ignore – VS Code a veces no resuelve tipos de 'nodemailer' con esta config
import nodemailer from "nodemailer";
import { config } from "./config";

type TransporterLike = {
  sendMail: (options: any) => Promise<any>;
} | null;

let transporter: TransporterLike = null;

export function getTransport(): TransporterLike {
  if (!config.email.host || !config.email.user || !config.email.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port ?? 587,
      secure: false,
      auth: { user: config.email.user!, pass: config.email.pass! }
    }) as any;
  }
  return transporter;
}

export async function sendLoginCode(email: string, code: string) {
  const t = getTransport();
  const text = `Tu código de acceso es: ${code} (válido por 10 minutos).`;

  if (!t) {
    console.log(`[EMAIL][FAKE] to=${email} :: ${text}`);
    return;
  }

  await t.sendMail({
    from: config.email.from,
    to: email,
    subject: "Tu código de acceso",
    text
  });
}

export default { getTransport, sendLoginCode };
