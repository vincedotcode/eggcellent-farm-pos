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
  const { data, error } = await supabase.rpc("get_sale_payment_summary", { 
    p_sale_id: saleId 
  });

  if (error) throw error;
  return data ? (data[0] as SalePaymentSummary) : null;
}

export async function getCustomerBalance(customerId: string): Promise<CustomerBalance | null> {
  const { data, error } = await supabase.rpc("get_customer_balance", { 
    p_customer_id: customerId 
  });

  if (error) throw error;
  return data ? (data[0] as CustomerBalance) : null;
}

export async function getAllOutstandingBalances(): Promise<CustomerBalance[]> {
  const { data, error } = await supabase.rpc("get_all_outstanding_balances");

  if (error) throw error;
  return (data ?? []) as CustomerBalance[];
}