import { useQuery } from "@tanstack/react-query";
import { listSales, getSaleItems, fetchSalesMetrics } from "./api";
import type { SalesQuery } from "./types";

export function useSales(params: SalesQuery) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => listSales(params),
    staleTime: 30_000,
  });
}

export function useSaleItems(saleId: string | null) {
  return useQuery({
    queryKey: ["sale_items", saleId],
    queryFn: () => {
      if (!saleId) return Promise.resolve([]);
      return getSaleItems(saleId);
    },
    enabled: !!saleId,
    staleTime: 60_000
  });
}

export function useSalesMetrics(days = 7) {
  return useQuery({
    queryKey: ["sales_metrics", days],
    queryFn: () => fetchSalesMetrics(days),
    staleTime: 30_000
  });
}
