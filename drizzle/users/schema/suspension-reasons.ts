import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const suspensionReasons = pgTable(
  "SuspensionReason",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    suspendedAt: timestamp("suspendedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("SuspensionReason_userId_idx").on(table.userId),
    index("SuspensionReason_suspendedAt_idx").on(table.suspendedAt),
  ],
);
