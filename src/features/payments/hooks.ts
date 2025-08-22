import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPayment, getSalePayments, getSalePaymentSummary, getCustomerBalance, getAllOutstandingBalances } from "./api";
import type { PaymentInsert } from "./types";

export function useAddPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addPayment,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["sale_payments", data.sale_id] });
      queryClient.invalidateQueries({ queryKey: ["sale_payment_summary", data.sale_id] });
      if (data.customer_id) {
        queryClient.invalidateQueries({ queryKey: ["customer_balance", data.customer_id] });
      }
      queryClient.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "sales" }); // ✅

      queryClient.invalidateQueries({ queryKey: ["outstanding_balances"] });
    },
  });
}

export function useSalePayments(saleId: string | null) {
  return useQuery({
    queryKey: ["sale_payments", saleId],
    queryFn: () => {
      if (!saleId) return Promise.resolve([]);
      return getSalePayments(saleId);
    },
    enabled: !!saleId,
    staleTime: 30_000
  });
}

export function useSalePaymentSummary(saleId: string | null) {
  return useQuery({
    queryKey: ["sale_payment_summary", saleId],
    queryFn: () => {
      if (!saleId) return Promise.resolve(null);
      return getSalePaymentSummary(saleId);
    },
    enabled: !!saleId,
    staleTime: 30_000
  });
}

export function useCustomerBalance(customerId: string | null) {
  return useQuery({
    queryKey: ["customer_balance", customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve(null);
      return getCustomerBalance(customerId);
    },
    enabled: !!customerId,
    staleTime: 30_000
  });
}

export function useOutstandingBalances() {
  return useQuery({
    queryKey: ["outstanding_balances"],
    queryFn: getAllOutstandingBalances,
    staleTime: 60_000
  });
}