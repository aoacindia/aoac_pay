import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as productsSchema from "@/drizzle/products/schema";
import { getServerEnv } from "@/lib/env";

const globalForProductsDb = globalThis as unknown as {
  productsQueryClient: ReturnType<typeof postgres> | undefined;
};

function createProductsQueryClient() {
  const env = getServerEnv();
  return postgres(env.DATABASE_URL_PRODUCTS, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

export function getProductsDb() {
  if (!globalForProductsDb.productsQueryClient) {
    globalForProductsDb.productsQueryClient = createProductsQueryClient();
  }
  return drizzle(globalForProductsDb.productsQueryClient, {
    schema: productsSchema,
  });
}

export type ProductsDatabase = ReturnType<typeof getProductsDb>;
