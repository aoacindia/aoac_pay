import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./drizzle/users/schema/index.ts",
  out: "./drizzle/users/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_USERS!,
  },
  verbose: true,
  strict: true,
});
