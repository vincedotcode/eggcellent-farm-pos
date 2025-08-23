export interface CustomerAnalytics {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  new_this_month: number;
  by_type: {
    retail: number;
    wholesale: number;
    restaurant: number;
    grocery: number;
  };
}

export interface InventoryAnalytics {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: number;
  categories: Array<{
    category: string;
    item_count: number;
    total_value: number;
  }>;
}

export interface SalesAnalytics {
  total_sales: number;
  total_revenue: number;
  average_order_value: number;
  today_sales: number;
  today_revenue: number;
  growth_rate: number;
  top_products: TopProduct[];
}

export interface FinancialAnalytics {
  total_outstanding: number;
  overdue_amount: number;
  overdue_customers: number;
  collection_rate: number;
  avg_collection_time: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface CustomerSegment {
  segment: string;
  customer_count: number;
  avg_order_value: number;
  total_revenue: number;
}