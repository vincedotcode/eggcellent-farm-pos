import { supabase } from "@/lib/supabase";
import type {
  CustomerAnalytics,
  InventoryAnalytics,
  SalesAnalytics,
  FinancialAnalytics,
  TopProduct,
  CustomerSegment
} from "./types";

/** Helpers */
const TZ = "Indian/Mauritius";
const toNumber = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : Number(v ?? d) || d);
const isOkStatus = (s?: string) => ["paid","completed","complete","fulfilled"].includes(String(s ?? "").toLowerCase());

/** Customers */
export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  const rpc = await supabase.rpc("get_customer_analytics");
  if (!rpc.error && rpc.data) {
    const d = rpc.data as CustomerAnalytics;
    return {
      total_customers: toNumber((d as any).total_customers),
      active_customers: toNumber((d as any).active_customers),
      inactive_customers: toNumber((d as any).inactive_customers),
      new_this_month: toNumber((d as any).new_this_month),
      by_type: {
        retail: toNumber((d as any).by_type?.retail),
        wholesale: toNumber((d as any).by_type?.wholesale),
        restaurant: toNumber((d as any).by_type?.restaurant),
        grocery: toNumber((d as any).by_type?.grocery),
      },
    };
  }

  // Fallback: compute client-side
  const { data: customers } = await supabase.from("customers").select("id, status, type, created_at");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const newThisMonth = (customers ?? []).filter(c => {
    const dt = new Date(c.created_at);
    return dt.getUTCFullYear() === year && dt.getUTCMonth() === month;
  }).length;

  const lower = (x: any) => String(x ?? "").toLowerCase();
  const all = customers ?? [];
  return {
    total_customers: all.length,
    active_customers: all.filter(c => lower(c.status) === "active").length,
    inactive_customers: all.filter(c => lower(c.status) === "inactive").length,
    new_this_month: newThisMonth,
    by_type: {
      retail: all.filter(c => lower(c.type) === "retail").length,
      wholesale: all.filter(c => lower(c.type) === "wholesale").length,
      restaurant: all.filter(c => lower(c.type) === "restaurant").length,
      grocery: all.filter(c => lower(c.type) === "grocery").length,
    }
  };
}

/** Inventory */
export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  const rpc = await supabase.rpc("get_inventory_analytics");
  if (!rpc.error && rpc.data) return rpc.data as InventoryAnalytics;

  const { data: products } = await supabase.from("products").select("id, category, stock, min_stock, price");
  const all = products ?? [];
  const totalValue = all.reduce((sum, p: any) => sum + toNumber(p.stock) * toNumber(p.price), 0);

  const categoriesMap = new Map<string, { category: string; item_count: number; total_value: number }>();
  for (const p of all) {
    const key = p.category ?? "Uncategorized";
    const row = categoriesMap.get(key) ?? { category: key, item_count: 0, total_value: 0 };
    row.item_count += 1;
    row.total_value += toNumber(p.stock) * toNumber(p.price);
    categoriesMap.set(key, row);
  }

  return {
    total_items: all.length,
    low_stock_items: all.filter(p => toNumber(p.stock) <= toNumber(p.min_stock)).length,
    out_of_stock_items: all.filter(p => toNumber(p.stock) === 0).length,
    total_inventory_value: totalValue,
    categories: Array.from(categoriesMap.values())
  };
}

/** Sales */
export async function getSalesAnalytics(days = 30): Promise<SalesAnalytics> {
  const rpc = await supabase.rpc("get_sales_analytics", { p_days: days });
  if (!rpc.error && rpc.data) {
    // ensure numeric
    const d = rpc.data as SalesAnalytics;
    return {
      total_sales: toNumber((d as any).total_sales),
      total_revenue: toNumber((d as any).total_revenue),
      average_order_value: toNumber((d as any).average_order_value),
      today_sales: toNumber((d as any).today_sales),
      today_revenue: toNumber((d as any).today_revenue),
      growth_rate: toNumber((d as any).growth_rate),
      top_products: (d as any).top_products ?? []
    };
  }

  // Fallback: try 'orders' then 'sales'
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const tryOrders = async (table: "orders" | "sales") => {
    const { data, error } = await supabase.from(table)
      .select("id, created_at, status, total_amount, total, grand_total, amount")
      .gte("created_at", since);
    if (error) return [] as any[];
    return data as any[];
  };

  let rows = await tryOrders("orders");
  if (!rows.length) rows = await tryOrders("sales");

  const amountOf = (r: any) => toNumber(r.total_amount ?? r.total ?? r.grand_total ?? r.amount);
  const ok = rows.filter(r => isOkStatus(r.status));
  const total_revenue = ok.reduce((s, r) => s + amountOf(r), 0);
  const total_sales = ok.length;
  const average_order_value = total_sales ? total_revenue / total_sales : 0;

  // Today in Mauritius
  const now = new Date();
  const mauritiusNow = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const startOfDay = new Date(mauritiusNow); startOfDay.setHours(0,0,0,0);
  const today_sales_rows = ok.filter(r => {
    const dt = new Date(r.created_at);
    const local = new Date(dt.toLocaleString("en-US", { timeZone: TZ }));
    return local >= startOfDay;
  });
  const today_revenue = today_sales_rows.reduce((s, r) => s + amountOf(r), 0);

  // Growth vs previous window (best-effort)
  const prevSince = new Date(Date.now() - days * 2 * 24 * 3600 * 1000).toISOString();
  const prevRowsRaw = await tryOrders("orders");
  const prevWin = prevRowsRaw.filter(r => {
    const dt = new Date(r.created_at).getTime();
    const cutoff = new Date(since).getTime();
    const startPrev = new Date(prevSince).getTime();
    return dt >= startPrev && dt < cutoff && isOkStatus(r.status);
  });
  const prevRev = prevWin.reduce((s, r) => s + amountOf(r), 0);
  const growth_rate = prevRev > 0 ? ((total_revenue - prevRev) / prevRev) * 100 : 0;

  // Top products fallback (best-effort)
  let top_products: TopProduct[] = [];
  try {
    const { data: items, error: e1 } = await supabase
      .from("order_items")
      .select("order_id, product_id, quantity, unit_price, price")
      .gte("created_at", since);
    if (!e1 && items?.length) {
      const { data: products } = await supabase.from("products").select("id, name");
      const nameById = new Map((products ?? []).map((p: any) => [p.id, p.name]));
      const agg = new Map<string, { product_id: string; product_name: string; total_quantity: number; total_revenue: number }>();
      for (const it of items) {
        const pid = it.product_id;
        const qty = toNumber(it.quantity);
        const rev = qty * toNumber(it.unit_price ?? it.price);
        const row = agg.get(pid) ?? { product_id: pid, product_name: nameById.get(pid) ?? "Unknown", total_quantity: 0, total_revenue: 0 };
        row.total_quantity += qty;
        row.total_revenue += rev;
        agg.set(pid, row);
      }
      top_products = Array.from(agg.values()).sort((a,b) => b.total_revenue - a.total_revenue).slice(0, 10);
    }
  } catch { /* noop */ }

  return { total_sales, total_revenue, average_order_value, today_sales: today_sales_rows.length, today_revenue, growth_rate, top_products };
}

/** Financials */
export async function getFinancialAnalytics(): Promise<FinancialAnalytics> {
  const rpc = await supabase.rpc("get_financial_analytics");
  if (!rpc.error && rpc.data) return rpc.data as FinancialAnalytics;

  // Fallback: compute from invoices
  const { data: inv } = await supabase
  .from("invoices")
  .select("id, customer_id, issued_at, due_date, status, balance_due, total, paid_amount, paid_at, created_at");
  const rows = inv ?? [];
  const outstanding = rows.map((r: any) => {
    const out = toNumber(r.balance_due, Math.max(toNumber(r.total) - toNumber(r.paid_amount), 0));
    const due = r.due_date ? new Date(r.due_date) : null;
    return { ...r, outstanding: out, due };
  });

  const total_outstanding = outstanding.reduce((s, r) => s + toNumber(r.outstanding), 0);
  const mauritiusToday = new Date(new Date().toLocaleString("en-US",{ timeZone: TZ }));
  mauritiusToday.setHours(0,0,0,0);
  const overdueRows = outstanding.filter(r => r.outstanding > 0 && r.due && r.due < mauritiusToday);
  const overdue_amount = overdueRows.reduce((s, r) => s + toNumber(r.outstanding), 0);
  const overdue_customers = new Set(overdueRows.map(r => r.customer_id)).size;
  const collection_rate = total_outstanding > 0 ? ((total_outstanding - overdue_amount) / total_outstanding) * 100 : 100;

  // Avg collection last 90d
  const paid90 = rows.filter(r => r.paid_at);
  let avg_collection_time = 0;
  if (paid90.length) {
    const days = paid90.map(r => {
      const paid = new Date(r.paid_at);
      const issued = new Date(r.issued_at ?? r.created_at ?? r.paid_at);
      return Math.max(0, (paid.getTime() - issued.getTime()) / 86400000);
    });
    avg_collection_time = Number((days.reduce((a,b)=>a+b,0) / days.length).toFixed(2));
  }

  return { total_outstanding, overdue_amount, overdue_customers, collection_rate: Number(collection_rate.toFixed(2)), avg_collection_time };
}

/** Top products */
export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const rpc = await supabase.rpc("get_top_products", { p_limit: limit });
  if (!rpc.error && rpc.data) return rpc.data as TopProduct[];
  return []; // already handled by Sales fallback if needed
}

/** Segments (leave as-is if you don't have it yet) */
export async function getCustomerSegments(): Promise<CustomerSegment[]> {
  const { data, error } = await supabase.rpc("get_customer_segments");
  if (!error && data) return data as CustomerSegment[];
  return [];
}

/** Mutations (unchanged) */
export async function bulkUpdateLowStock(): Promise<void> {
  const { error } = await supabase.rpc("bulk_update_low_stock");
  if (error) throw error;
}
export async function markAllBalancesPaid(): Promise<void> {
  const { error } = await supabase.rpc("mark_all_balances_paid");
  if (error) throw error;
}
