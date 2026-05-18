import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./drizzle/products/schema/index.ts",
  out: "./drizzle/products/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_PRODUCTS!,
  },
  verbose: true,
  strict: true,
});
