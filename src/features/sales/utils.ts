export const fmtMoney = (n: number | string) => `Rs ${Number(n ?? 0).toFixed(2)}`;
export const shortId = (id: string) => id?.slice(0, 8);

export function toExclusiveEnd(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function toISOStart(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** NEW: derive payment status for badges/formatting */
export type PaymentStatus = "paid" | "partial" | "unpaid";

export function paymentStatus(total: number, paid: number): PaymentStatus {
  const eps = 0.01;
  if (paid >= total - eps) return "paid";
  if (paid > eps) return "partial";
  return "unpaid";
}


