/**
 * Indian financial year: April 1 – March 31.
 * Returns label like "2025-26".
 */
export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed; April = 3

  if (month >= 3) {
    const start = year;
    const end = (year + 1) % 100;
    return `${start}-${String(end).padStart(2, "0")}`;
  }

  const start = year - 1;
  const end = year % 100;
  return `${start}-${String(end).padStart(2, "0")}`;
}

export function formatTaxInvoiceNumber(params: {
  officeId: string;
  financialYear: string;
  sequence: number;
}): string {
  const seq = String(params.sequence).padStart(5, "0");
  return `${params.officeId}/${params.financialYear}/${seq}`;
}
