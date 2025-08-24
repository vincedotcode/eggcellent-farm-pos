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
// types.ts
// types.ts
export type SalesMetrics = {
  start_date: string;     // e.g. "2025-08-18"
  end_date: string;       // e.g. "2025-08-24"
  orders_count: number;   // 7-day order count
  total_revenue: number;  // 7-day gross revenue
  total_paid: number;     // 7-day payments received
  outstanding: number;    // 7-day revenue minus paid
  avg_order_value: number;// 7-day AOV
};
