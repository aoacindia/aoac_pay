import { boolean, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const popupAnnouncements = pgTable(
  "PopupAnnouncement",
  {
    id: text("id").primaryKey(),
    isActive: boolean("isActive").default(false).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    startDate: timestamp("startDate", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    endDate: timestamp("endDate", { precision: 3, mode: "date" }),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [index("PopupAnnouncement_isActive_idx").on(table.isActive)],
);
