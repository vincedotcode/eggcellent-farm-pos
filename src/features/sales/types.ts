export type SaleRow = {
  id: string;
  created_at: string;
  customer_id: string | null;
  customer_name: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  item_count: number;
  // NEW
  paid_total: number;    // sum(sale_payments.amount_paid)
  balance_due: number;   // max(total - paid_total, 0)
};

  export type SaleItem = {
    id: string;
    sale_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    tax_rate: number; // percent
    created_at: string;
  };
  
  export type SalesQuery = {
    query?: string;
    dateFrom?: string | null; // ISO
    dateTo?: string | null;   // ISO (exclusive end)
    limit?: number;
    offset?: number;
  };
  
  export type SalesMetrics = {
    sales_count_7d: number;
    revenue_7d: number;
    aov_7d: number;
    sales_today: number;
    revenue_today: number;
    top_product_name: string | null;
    top_product_qty: number;
  };
  