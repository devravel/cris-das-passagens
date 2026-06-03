import { statSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

function getPrismaSchemaVersion(): string {
  const schemaPath = join(process.cwd(), "prisma/schema.prisma");
  const generatedPath = join(
    process.cwd(),
    "lib/generated/prisma/internal/class.ts",
  );

  let generatedMtime = 0;

  try {
    generatedMtime = statSync(generatedPath).mtimeMs;
  } catch {
    generatedMtime = 0;
  }

  return `${statSync(schemaPath).mtimeMs}:${generatedMtime}`;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing env: DATABASE_URL");
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isStalePrismaClient(client: PrismaClient | undefined): client is undefined {
  if (!client) {
    return true;
  }

  return typeof client.package?.findMany !== "function";
}

function getPrismaClient(): PrismaClient {
  const schemaVersion = getPrismaSchemaVersion();
  const cachedVersion = globalForPrisma.prismaSchemaVersion;
  const cachedClient = globalForPrisma.prisma;

  if (
    !isStalePrismaClient(cachedClient) &&
    cachedVersion === schemaVersion
  ) {
    return cachedClient;
  }

  if (cachedClient) {
    void cachedClient.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaSchemaVersion = schemaVersion;
  }

  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver) as unknown;

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});
