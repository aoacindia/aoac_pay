import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const suppliers = pgTable(
  "Supplier",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    gstNumber: text("gstNumber"),
    fssaiLicense: text("fssaiLicense"),
    houseNo: text("houseNo").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    state: text("state").notNull(),
    stateCode: text("stateCode"),
    country: text("country").default("India").notNull(),
    pincode: text("pincode").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    index("Supplier_email_idx").on(table.email),
    index("Supplier_phone_idx").on(table.phone),
  ],
);
