import { eq, and, sql, type ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import * as usersSchema from "@/drizzle/users/schema";
import { orders } from "@/drizzle/users/schema";
import {
  formatTaxInvoiceNumber,
  getFinancialYear,
} from "@/lib/invoice/numbering";

type UsersTx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof usersSchema,
  ExtractTablesWithRelations<typeof usersSchema>
>;

export async function convertProformaToTaxInvoiceTx(
  tx: UsersTx,
  orderId: string,
): Promise<void> {
  const [order] = await tx
    .select({
      id: orders.id,
      invoiceType: orders.invoiceType,
      invoiceOfficeId: orders.invoiceOfficeId,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.invoiceType !== "PI" || !order.invoiceOfficeId) {
    return;
  }

  const officeId = order.invoiceOfficeId;
  const fy = getFinancialYear();

  const [maxRow] = await tx
    .select({
      maxSeq: sql<number>`COALESCE(MAX(${orders.invoiceSequenceNumber}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.invoiceOfficeId, officeId),
        eq(orders.invoiceType, "TAX_INVOICE"),
        sql`EXTRACT(YEAR FROM ${orders.orderDate}) = EXTRACT(YEAR FROM NOW())`,
      ),
    );

  const nextSequence = (maxRow?.maxSeq ?? 0) + 1;
  const invoiceNumber = formatTaxInvoiceNumber({
    officeId,
    financialYear: fy,
    sequence: nextSequence,
  });

  await tx
    .update(orders)
    .set({
      invoiceType: "TAX_INVOICE",
      invoiceSequenceNumber: nextSequence,
      invoiceNumber,
    })
    .where(eq(orders.id, orderId));
}
