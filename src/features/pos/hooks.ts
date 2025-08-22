import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosProducts, fetchPosCustomers, posCheckout } from "./api";
import type { CartItem, CheckoutArgs, CheckoutResponse } from "./types";

export function usePosProducts(search = "") {
  return useQuery({
    queryKey: ["pos_products", search],
    queryFn: () => fetchPosProducts(search),
    staleTime: 20_000
  });
}

export function usePosCustomers(search = "") {
  return useQuery({
    queryKey: ["pos_customers", search],
    queryFn: () => fetchPosCustomers(search),
    staleTime: 60_000
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation<CheckoutResponse, any, CheckoutArgs>({
    mutationFn: (payload) => posCheckout(payload),
    onSuccess: () => {
      // Refresh any inventory lists after a sale decremented stock
      qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "products" });
      qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "pos_products" });
    }
  });
}
