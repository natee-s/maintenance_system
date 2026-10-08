import "dotenv/config";
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
const directory = resolve(".local-postgres");
if (process.env.NODE_ENV === "production") throw new Error("Local development database only");
if (!existsSync(".env")) {
  const password = randomBytes(24).toString("hex");
  const url = `postgresql://cmms:${password}@localhost:54329/cmms?schema=public`;
  writeFileSync(".env", `DATABASE_URL=${url}\nAUTH_SECRET=${randomBytes(40).toString("hex")}\nAUTH_URL=http://localhost:3000\nAUTH_TRUST_HOST=true\nAPP_URL=http://localhost:3000\nAPP_TIMEZONE=Asia/Bangkok\nLOCAL_STORAGE_PATH=./storage\nMAX_UPLOAD_MB=10\nSEED_PASSWORD=PilotDemo!2026\n`);
  process.env.DATABASE_URL = url;
}
const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || url.port !== "54329") throw new Error("db:local requires local port 54329; use existing external PostgreSQL normally");
const pg = new EmbeddedPostgres({ databaseDir: directory, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), port: 54329, persistent: true, authMethod: "scram-sha-256", initdbFlags: ["--encoding=UTF8", "--locale=C"], postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: (error) => console.error(String(error)) });
if (!existsSync(resolve(directory, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient("postgres"); await client.connect();
const database = url.pathname.slice(1);
if (!/^cmms(?:_[a-z0-9]+)?$/.test(database)) throw new Error("Local database name must be cmms or cmms_<suffix>");
const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
if (!result.rowCount) await client.query(`CREATE DATABASE "${database}" WITH TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'`);
await client.end();
console.log("Local PostgreSQL ready on 127.0.0.1:54329. Keep this process open; Ctrl+C stops it and preserves data.");
const close = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", close); process.on("SIGTERM", close);
await new Promise(() => {});
