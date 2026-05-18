import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const announcements = pgTable(
  "Announcement",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdBy: text("createdBy").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("Announcement_createdAt_idx").on(table.createdAt)],
);
