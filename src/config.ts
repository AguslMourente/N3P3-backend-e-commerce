import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? "dev",
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM ?? "no-reply@demo.local"
  },
  mp: {
    accessToken: process.env.MP_ACCESS_TOKEN,
    webhookUrl: process.env.MP_WEBHOOK_PUBLIC_URL ?? "http://localhost:3000/mp/mercadopago"
  },
  algolia: {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    index: process.env.ALGOLIA_INDEX ?? "products"
  }
};
