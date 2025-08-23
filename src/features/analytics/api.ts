import { supabase } from "@/lib/supabase";
import type { 
  CustomerAnalytics, 
  InventoryAnalytics, 
  SalesAnalytics, 
  FinancialAnalytics,
  TopProduct,
  CustomerSegment
} from "./types";

export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  const { data, error } = await supabase.rpc("get_customer_analytics");
  if (error) {
    // Fallback query if function doesn't exist
    const { data: customers } = await supabase.from("customers").select("*");
    const active = customers?.filter(c => c.status === 'Active').length || 0;
    const inactive = customers?.filter(c => c.status === 'Inactive').length || 0;
    const retail = customers?.filter(c => c.type === 'Retail').length || 0;
    const wholesale = customers?.filter(c => c.type === 'Wholesale').length || 0;
    const restaurant = customers?.filter(c => c.type === 'Restaurant').length || 0;
    const grocery = customers?.filter(c => c.type === 'Grocery').length || 0;
    
    return {
      total_customers: customers?.length || 0,
      active_customers: active,
      inactive_customers: inactive,
      new_this_month: 0,
      by_type: { retail, wholesale, restaurant, grocery }
    };
  }
  return data as CustomerAnalytics;
}

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  const { data, error } = await supabase.rpc("get_inventory_analytics");
  if (error) {
    // Fallback query
    const { data: products } = await supabase.from("products").select("*");
    const totalItems = products?.length || 0;
    const lowStock = products?.filter(p => p.stock <= p.min_stock).length || 0;
    const outOfStock = products?.filter(p => p.stock === 0).length || 0;
    const totalValue = products?.reduce((sum, p) => sum + (p.stock * p.price), 0) || 0;
    
    return {
      total_items: totalItems,
      low_stock_items: lowStock,
      out_of_stock_items: outOfStock,
      total_inventory_value: totalValue,
      categories: []
    };
  }
  return data as InventoryAnalytics;
}

export async function getSalesAnalytics(days = 30): Promise<SalesAnalytics> {
  const { data, error } = await supabase.rpc("get_sales_analytics", { p_days: days });
  if (error) {
    // Fallback to existing sales metrics
    const { data: metrics } = await supabase.rpc("sales_metrics", { p_days: days });
    return {
      total_sales: metrics?.sales_count_7d || 0,
      total_revenue: metrics?.revenue_7d || 0,
      average_order_value: metrics?.aov_7d || 0,
      today_sales: metrics?.sales_today || 0,
      today_revenue: metrics?.revenue_today || 0,
      growth_rate: 0,
      top_products: []
    };
  }
  return data as SalesAnalytics;
}

export async function getFinancialAnalytics(): Promise<FinancialAnalytics> {
  const { data, error } = await supabase.rpc("get_financial_analytics");
  if (error) {
    // Fallback query
    const { data: balances } = await supabase.rpc("outstanding_balances_summary");
    const totalOutstanding = balances?.reduce((sum: number, b: any) => sum + Number(b.total_outstanding), 0) || 0;
    const overdueAmount = balances?.reduce((sum: number, b: any) => sum + Number(b.overdue_amount), 0) || 0;
    const overdueCustomers = balances?.filter((b: any) => Number(b.overdue_amount) > 0).length || 0;
    
    return {
      total_outstanding: totalOutstanding,
      overdue_amount: overdueAmount,
      overdue_customers: overdueCustomers,
      collection_rate: totalOutstanding > 0 ? ((totalOutstanding - overdueAmount) / totalOutstanding) * 100 : 100,
      avg_collection_time: 0
    };
  }
  return data as FinancialAnalytics;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const { data, error } = await supabase.rpc("get_top_products", { p_limit: limit });
  if (error) {
    return [];
  }
  return data as TopProduct[];
}

export async function getCustomerSegments(): Promise<CustomerSegment[]> {
  const { data, error } = await supabase.rpc("get_customer_segments");
  if (error) {
    return [];
  }
  return data as CustomerSegment[];
}

export async function bulkUpdateLowStock(): Promise<void> {
  const { error } = await supabase.rpc("bulk_update_low_stock");
  if (error) throw error;
}

export async function markAllBalancesPaid(): Promise<void> {
  const { error } = await supabase.rpc("mark_all_balances_paid");
  if (error) throw error;
}