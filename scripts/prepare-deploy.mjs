import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// vinext build emits a placeholder D1 id and an R2 binding that production
// does not have. Patch the generated config so CI deploys to the real D1.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const configPath = path.join(projectRoot, "dist/server/wrangler.json");
const databaseId = process.env.D1_DATABASE_ID || "5bf70fb8-3527-43c2-914a-8e41835e67bc";

const config = JSON.parse(readFileSync(configPath, "utf8"));
config.r2_buckets = [];
config.d1_databases = [
  {
    binding: "DB",
    database_name: "site-creator-d1",
    database_id: databaseId,
    migrations_dir: "../../drizzle",
  },
];
writeFileSync(configPath, JSON.stringify(config));
console.log(`Deploy config prepared (D1 ${databaseId}).`);
