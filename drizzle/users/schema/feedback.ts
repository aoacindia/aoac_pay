import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const feedback = pgTable("Feedback", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
    .defaultNow()
    .notNull(),
});
