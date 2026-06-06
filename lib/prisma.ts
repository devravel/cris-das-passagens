import { statSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: pg.Pool;
  prismaSchemaVersion?: string;
};

function getPrismaSchemaVersion(): string | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

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

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing env: DATABASE_URL");
  }

  return connectionString;
}

function getPgPool(): pg.Pool {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = new pg.Pool({
      connectionString: getConnectionString(),
      // Supabase pooler + Vercel: uma conexão por instância serverless.
      max: process.env.NODE_ENV === "production" ? 1 : 10,
    });
  }

  return globalForPrisma.prismaPool;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(getPgPool());

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
  const cachedClient = globalForPrisma.prisma;

  if (schemaVersion === null) {
    if (!isStalePrismaClient(cachedClient)) {
      return cachedClient;
    }
  } else if (
    !isStalePrismaClient(cachedClient) &&
    globalForPrisma.prismaSchemaVersion === schemaVersion
  ) {
    return cachedClient;
  }

  if (cachedClient) {
    void cachedClient.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (schemaVersion !== null && globalForPrisma.prismaPool) {
    void globalForPrisma.prismaPool.end().catch(() => undefined);
    globalForPrisma.prismaPool = undefined;
    globalForPrisma.prismaSchemaVersion = undefined;
  }

  const client = createPrismaClient();

  globalForPrisma.prisma = client;

  if (schemaVersion !== null) {
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
