export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Overdue';

export type Payment = {
  id: string;
  sale_id: string;
  customer_id: string | null;
  amount_paid: number;
  payment_method: 'Cash' | 'Card' | 'Check' | 'Bank Transfer';
  payment_date: string;
  notes?: string | null;
  created_at: string;
};

export type SalePaymentSummary = {
  sale_id: string;
  total_amount: number;
  total_paid: number;
  balance_due: number;
  payment_status: PaymentStatus;
  customer_name: string | null;
  sale_date: string;
};

export type CustomerBalance = {
  customer_id: string;
  customer_name: string;
  total_outstanding: number;
  overdue_amount: number;
  total_sales: number;
  pending_sales: SalePaymentSummary[];
};

export type PaymentInsert = {
  sale_id: string;
  customer_id: string | null;
  amount_paid: number;
  payment_method: 'Cash' | 'Card' | 'Check' | 'Bank Transfer';
  notes?: string | null;
};