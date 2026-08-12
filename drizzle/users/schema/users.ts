import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "User",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    suspended: boolean("suspended").default(false).notNull(),
    suspendedNumber: integer("suspended_number").default(0).notNull(),
    terminated: boolean("terminated").default(false).notNull(),
    phone: text("phone").notNull(),
    password: text("password"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("User_email_key").on(table.email),
    uniqueIndex("User_phone_key").on(table.phone),
  ],
);
