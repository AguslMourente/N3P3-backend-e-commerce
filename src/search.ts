import { db } from "./db";
import { config } from "./config";

export async function searchProducts(q: string, offset: number, limit: number) {
  if (!config.algolia.appId || !config.algolia.apiKey) {
    const sql = `
      SELECT id,title,price,stock,data_json
      FROM products
      WHERE stock > 0 AND title LIKE ?
      ORDER BY title ASC
      LIMIT ? OFFSET ?`;
    const rows = db.prepare(sql).all(`%${q}%`, limit, offset);
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      stock: r.stock,
      ...JSON.parse(r.data_json ?? "{}")
    }));
  }

  // @ts-ignore: Algolia es opcional; ignoramos tipos si el paquete no está instalado
  const algoliasearch = (await import("algoliasearch")).default;
  const client = algoliasearch(config.algolia.appId!, config.algolia.apiKey!);
  const index = client.initIndex(config.algolia.index!);
  const res = await index.search(q, { page: Math.floor(offset / limit), hitsPerPage: limit });
  return res.hits;
}
