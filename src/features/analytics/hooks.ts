// /src/features/analytics/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerAnalytics,
  getInventoryAnalytics,
  getSalesAnalytics,
  getFinancialAnalytics,
  getTopProducts,
  getCustomerSegments,
  bulkUpdateLowStock,
  markAllBalancesPaid,
} from "./api";

const DEFAULT_STALE = 30_000;
const REFRESH = 60_000;

/** Queries */
export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer_analytics"],
    queryFn: getCustomerAnalytics,
    staleTime: DEFAULT_STALE,
    refetchInterval: REFRESH,
  });
}

export function useInventoryAnalytics() {
  return useQuery({
    queryKey: ["inventory_analytics"],
    queryFn: getInventoryAnalytics,
    staleTime: DEFAULT_STALE,
    refetchInterval: REFRESH,
  });
}

export function useSalesAnalytics(days = 30) {
  return useQuery({
    queryKey: ["sales_analytics", days],
    queryFn: () => getSalesAnalytics(days),
    staleTime: DEFAULT_STALE,
    refetchInterval: REFRESH,
  });
}

export function useFinancialAnalytics() {
  return useQuery({
    queryKey: ["financial_analytics"],
    queryFn: getFinancialAnalytics,
    staleTime: DEFAULT_STALE,
    refetchInterval: REFRESH,
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["top_products", limit],
    queryFn: () => getTopProducts(limit),
    staleTime: 60_000,
    refetchInterval: REFRESH,
  });
}

export function useCustomerSegments() {
  return useQuery({
    queryKey: ["customer_segments"],
    queryFn: getCustomerSegments,
    staleTime: 60_000,
    refetchInterval: REFRESH,
  });
}

/** Mutations (needed by QuickActions.tsx) */
export function useBulkUpdateLowStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateLowStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_analytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useMarkAllBalancesPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllBalancesPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_analytics"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding_balances"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
