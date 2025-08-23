import { supabase } from "@/lib/supabase";
import type { SaleRow, SalesQuery, SaleItem, SalesMetrics } from "./types";

export async function listSales(params: SalesQuery): Promise<SaleRow[]> {
  const { query = "", dateFrom = null, dateTo = null, limit = 100, offset = 0 } = params;
  const { data, error } = await supabase.rpc("sales_search", {
    p_query: query ? query : null,
    p_date_from: dateFrom,
    p_date_to: dateTo,
    p_limit: limit,
    p_offset: offset
  });
  if (error) throw error;

  // PG numeric → JS string by default. Normalize.
  const rows = (data ?? []).map((r: any): SaleRow => ({
    ...r,
    subtotal: Number(r.subtotal ?? 0),
    tax_amount: Number(r.tax_amount ?? 0),
    total: Number(r.total ?? 0),
    paid_total: Number(r.paid_total ?? 0),
    balance_due: Number(r.balance_due ?? 0),
    item_count: Number(r.item_count ?? 0),
  }));
  return rows;
}

export async function getSaleItems(saleId: string): Promise<SaleItem[]> {
  const { data, error } = await supabase
    .from("sale_items")
    .select("id,sale_id,product_id,product_name,quantity,price,tax_rate") // no created_at
    .eq("sale_id", saleId)
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((it: any) => ({
    ...it,
    price: Number(it.price ?? 0),
    tax_rate: Number(it.tax_rate ?? 0),
    quantity: Number(it.quantity ?? 0),
  })) as SaleItem[];
}

export async function fetchSalesMetrics(days = 7): Promise<SalesMetrics> {
  const { data, error } = await supabase.rpc("sales_metrics", { p_days: days });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  // Assume numeric coercion server-side or coerce here if needed
  return row as SalesMetrics;
}
