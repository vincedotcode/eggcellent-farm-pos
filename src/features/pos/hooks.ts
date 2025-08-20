import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPosProducts, fetchPosCustomers, checkoutSale } from "./api";
import type { CartItem } from "./types";

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
  return useMutation({
    mutationFn: ({ customerId, cart }: { customerId: string | null; cart: CartItem[] }) =>
      checkoutSale(customerId, cart),
  });
}
