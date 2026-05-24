/**
 * One-time script to create the first admin user.
 *
 * Usage:
 *   npm run admin:create -- admin@example.com "your-secure-password"
 */
import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import pg from "pg";

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error(
    'Usage: npm run admin:create -- <email> "your-secure-password"',
  );
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const password = passwordArg;

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

try {
  await client.connect();

  const existing = await client.query(
    'SELECT id FROM "AdminUser" WHERE email = $1 LIMIT 1',
    [email],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    console.error(`Admin already exists for ${email}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await client.query(
    'INSERT INTO "AdminUser" (id, email, "passwordHash", "createdAt") VALUES ($1, $2, $3, NOW())',
    [randomUUID(), email, passwordHash],
  );

  console.log(`Admin user created: ${email}`);
} catch (error) {
  console.error("Failed to create admin user:", error);
  process.exit(1);
} finally {
  await client.end();
}
