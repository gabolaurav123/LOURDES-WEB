import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

const products = [
  ["nocturna", "Nocturna", "Colección · 24 fotos", 29, "Más vendido", "ruby"],
  ["luz-privada", "Luz privada", "Video · 08:42", 18, "Nuevo", "gold"],
  ["entre-lineas", "Entre líneas", "Editorial · 16 fotos", 24, "Exclusivo", "rose"],
  ["after-hours", "After hours", "Video · 12:10", 32, "Premium", "ink"],
];

async function prepare() {
  const db = env.DB;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, price REAL NOT NULL, tag TEXT NOT NULL, tone TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS support_tickets (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, category TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS activity_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, metadata TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
  ]);
  const found = await db.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>();
  if (!found?.count) {
    await db.batch(products.map((p) => db.prepare("INSERT INTO products (id,title,type,price,tag,tone) VALUES (?,?,?,?,?,?)").bind(...p)));
  }
  return db;
}

export async function GET() {
  try {
    const db = await prepare();
    const result = await db.prepare("SELECT id,title,type,price,tag,tone FROM products WHERE status = 'published' ORDER BY created_at").all();
    return Response.json({ products: result.results }, { headers: { "cache-control": "public, max-age=60" } });
  } catch {
    return Response.json({ products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    if (body.action !== "ticket" || !body.name || !body.email || !body.message) return Response.json({ error: "invalid_request" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(body.email) || body.message.length > 4000) return Response.json({ error: "invalid_fields" }, { status: 422 });
    const db = await prepare();
    const id = crypto.randomUUID();
    await db.batch([
      db.prepare("INSERT INTO support_tickets (id,name,email,category,message) VALUES (?,?,?,?,?)").bind(id, body.name.slice(0, 120), body.email.slice(0, 200), (body.category || "General").slice(0, 80), body.message),
      db.prepare("INSERT INTO activity_log (id,action,entity_type,entity_id,metadata) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), "ticket.created", "support_ticket", id, JSON.stringify({ category: body.category || "General" })),
    ]);
    return Response.json({ ok: true, ticketId: id }, { status: 201 });
  } catch {
    return Response.json({ error: "service_unavailable" }, { status: 503 });
  }
}
