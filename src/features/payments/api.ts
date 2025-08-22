import { supabase } from "@/lib/supabase";
import type { Payment, PaymentInsert, SalePaymentSummary, CustomerBalance } from "./types";

export async function addPayment(payment: PaymentInsert): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert([{
      sale_id: payment.sale_id,
      customer_id: payment.customer_id,
      amount_paid: payment.amount_paid,
      payment_method: payment.payment_method,
      notes: payment.notes,
      payment_date: new Date().toISOString()
    }])
    .select("*")
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function getSalePayments(saleId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("sale_id", saleId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function getSalePaymentSummary(saleId: string): Promise<SalePaymentSummary | null> {
  try {
    const { data, error } = await supabase.rpc("get_sale_payment_summary", { 
      p_sale_id: saleId 
    });

    if (error) throw error;
    return data ? (data[0] as SalePaymentSummary) : null;
  } catch (error) {
    // Fallback: calculate manually using direct queries
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("amount_paid")
      .eq("sale_id", saleId);
    
    const { data: salesData } = await supabase
      .from("sales")
      .select("total")
      .eq("id", saleId)
      .single();

    if (paymentsData && salesData) {
      const totalPaid = paymentsData.reduce((sum, p) => sum + p.amount_paid, 0);
      return {
        sale_id: saleId,
        total_amount: salesData.total,
        total_paid: totalPaid,
        balance_due: salesData.total - totalPaid,
        payment_status: (salesData.total - totalPaid) <= 0.01 ? 'Paid' : 'Partial',
        customer_name: null,
        sale_date: new Date().toISOString()
      };
    }
    return null;
  }
}

export async function getCustomerBalance(customerId: string): Promise<CustomerBalance | null> {
  try {
    const { data, error } = await supabase.rpc("get_customer_balance", { 
      p_customer_id: customerId 
    });

    if (error) throw error;
    return data ? (data[0] as CustomerBalance) : null;
  } catch (error) {
    // Fallback: calculate manually using direct queries
    const { data: salesData } = await supabase
      .from("sales")
      .select("id, total")
      .eq("customer_id", customerId);
    
    if (salesData && salesData.length > 0) {
      const saleIds = salesData.map(s => s.id);
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount_paid")
        .in("sale_id", saleIds);

      const totalSales = salesData.reduce((sum, s) => sum + s.total, 0);
      const totalPaid = paymentsData?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
      const balance = totalSales - totalPaid;

      return {
        customer_id: customerId,
        customer_name: "Unknown", // Would need to join with customers table
        total_outstanding: balance,
        overdue_amount: 0, // Would need additional logic to determine overdue
        total_sales: totalSales,
        pending_sales: [] // Would need additional query for pending sales
      };
    }
    return null;
  }
}

export async function getAllOutstandingBalances(): Promise<CustomerBalance[]> {
  try {
    const { data, error } = await supabase.rpc("get_all_outstanding_balances");

    if (error) throw error;
    return (data ?? []) as CustomerBalance[];
  } catch (error) {
    // Fallback: calculate manually using direct queries
    const { data: salesData } = await supabase
      .from("sales")
      .select(`
        id, 
        customer_id, 
        total,
        customers!inner(name)
      `)
      .not("customer_id", "is", null);

    if (salesData && salesData.length > 0) {
      const customerBalances: { [key: string]: CustomerBalance } = {};

      // Group by customer and calculate totals
      for (const sale of salesData) {
        if (!customerBalances[sale.customer_id]) {
          customerBalances[sale.customer_id] = {
            customer_id: sale.customer_id,
            customer_name: (sale.customers as any)?.name || "Unknown",
            total_outstanding: 0,
            overdue_amount: 0,
            total_sales: 0,
            pending_sales: []
          };
        }
        customerBalances[sale.customer_id].total_sales += sale.total;
      }

      // Get all payments for these customers
      const saleIds = salesData.map(s => s.id);
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("sale_id, amount_paid")
        .in("sale_id", saleIds);

      // Calculate payments per customer
      const paymentsByCustomer: { [key: string]: number } = {};
      if (paymentsData) {
        for (const payment of paymentsData) {
          const sale = salesData.find(s => s.id === payment.sale_id);
          if (sale) {
            if (!paymentsByCustomer[sale.customer_id]) {
              paymentsByCustomer[sale.customer_id] = 0;
            }
            paymentsByCustomer[sale.customer_id] += payment.amount_paid;
          }
        }
      }

      // Calculate final balances and filter out fully paid customers
      const result = Object.values(customerBalances)
        .map(cb => ({
          ...cb,
          total_outstanding: cb.total_sales - (paymentsByCustomer[cb.customer_id] || 0)
        }))
        .filter(cb => cb.total_outstanding > 0.01);

      return result;
    }
    return [];
  }
}