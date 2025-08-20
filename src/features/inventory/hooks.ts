import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listProducts, createProduct, updateProduct, adjustStock, ListParams } from "./api";
import type { ProductInsert } from "./types";

const qk = (params: ListParams) => ["products", params] as const;

export function useProducts(params: ListParams) {
  return useQuery({
    queryKey: qk(params),
    queryFn: () => listProducts(params),
    staleTime: 30_000
  });
}

export function useCreateProduct(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInsert) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}

export function useUpdateProduct(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ProductInsert> }) =>
      updateProduct(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}

export function useAdjustStock(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, delta, reason }: { productId: string; delta: number; reason?: string }) =>
      adjustStock(productId, delta, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}
