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
  return (data ?? []) as SaleRow[];
}

export async function getSaleItems(saleId: string): Promise<SaleItem[]> {
  const { data, error } = await supabase
    .from("sale_items")
    .select("id,sale_id,product_id,product_name,quantity,price,tax_rate,created_at")
    .eq("sale_id", saleId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SaleItem[];
}

export async function fetchSalesMetrics(days = 7): Promise<SalesMetrics> {
  const { data, error } = await supabase.rpc("sales_metrics", { p_days: days });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as SalesMetrics;
}
