/**
 * Update an existing admin user's password.
 *
 * Usage:
 *   npm run admin:change-password -- admin@example.com "your-new-password"
 */
import bcrypt from "bcryptjs";
import pg from "pg";

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error(
    'Usage: npm run admin:change-password -- <email> "your-new-password"',
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

  if (!existing.rowCount || existing.rowCount === 0) {
    console.error(`No admin found for ${email}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await client.query(
    'UPDATE "AdminUser" SET "passwordHash" = $1 WHERE email = $2',
    [passwordHash, email],
  );

  console.log(`Password updated for admin: ${email}`);
} catch (error) {
  console.error("Failed to update admin password:", error);
  process.exit(1);
} finally {
  await client.end();
}
