import { pgTable, text, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const passwordResets = pgTable(
  "PasswordReset",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    token: text("token").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("PasswordReset_token_key").on(table.token),
    index("PasswordReset_userId_idx").on(table.userId),
  ],
);
