import { execSync } from "node:child_process";

function resolveMigrationDatabaseUrl() {
  const directUrl = process.env.DIRECT_URL?.trim();
  if (directUrl) {
    return directUrl;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL. Set DIRECT_URL or DATABASE_URL in .env.");
  }

  if (databaseUrl.includes(":6543")) {
    return databaseUrl.replace(":6543", ":5432");
  }

  return databaseUrl;
}

const migrationUrl = resolveMigrationDatabaseUrl();

console.log("Applying Prisma migrations using direct Postgres connection...");

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: migrationUrl,
  },
});

console.log("Regenerating Prisma Client...");
execSync("npx prisma generate", { stdio: "inherit" });

console.log("Migrations applied successfully.");
console.log("Reinicie o servidor de desenvolvimento (npm run dev) se ele estiver aberto.");
