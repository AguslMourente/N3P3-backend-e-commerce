import { config } from "./config";

const mpEnabled = !!config.mp.accessToken;

/** Devuelve {preferenceId, initPoint}. Si no hay token MP, usa modo fake. */
export async function createPaymentPreference(opts: {
  orderId: number;
  title: string;
  quantity: number;
  unit_price: number;
  payer_email: string;
}): Promise<{ preferenceId: string; initPoint: string }> {
  if (!mpEnabled) {
    return {
      preferenceId: `fake-pref-${opts.orderId}`,
      initPoint: `https://example.com/pay?order=${opts.orderId}`
    };
  }

  const mod: any = await import("mercadopago");
  const MercadoPagoConfig = mod.default?.MercadoPagoConfig ?? mod.MercadoPagoConfig;
  const Preference = mod.default?.Preference ?? mod.Preference;

  const client = new MercadoPagoConfig({ accessToken: config.mp.accessToken! });
  const pref = new Preference(client);
  const res = await pref.create({
    items: [{ title: opts.title, quantity: opts.quantity, currency_id: "EUR", unit_price: Number(opts.unit_price) }],
    external_reference: String(opts.orderId),
    payer: { email: opts.payer_email },
    back_urls: { success: "https://example.com/success", failure: "https://example.com/failure", pending: "https://example.com/pending" },
    notification_url: config.mp.webhookUrl
  });

  return { preferenceId: res.id, initPoint: res.init_point };
}

