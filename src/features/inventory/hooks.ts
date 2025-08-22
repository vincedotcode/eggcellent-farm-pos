import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listProducts, createProduct, updateProduct,
  moveStock, setStock, listStockMovements
} from "./api";
import type { ListParams, MovementsParams, Product, ProductInsert } from "./types";

/** Query keys */
const qkProducts = (params: ListParams) => ["products", params] as const;
const qkMovements = (params: MovementsParams) => ["stock-movements", params] as const;

/** PRODUCTS */
export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: qkProducts(params),
    queryFn: () => listProducts(params),
    staleTime: 30_000
  });
}

export function useCreateProduct(paramsToInvalidate: ListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInsert) => createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkProducts(paramsToInvalidate) })
  });
}

export function useUpdateProduct(paramsToInvalidate: ListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ProductInsert> }) => updateProduct(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkProducts(paramsToInvalidate) })
  });
}

/** STOCK CONTROL */
// ...
// /src/features/inventory/hooks.ts
export function useMoveStock(paramsToInvalidate: ListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { productId: string; delta: number; reason?: string; refType?: string | null; refId?: string | null }) =>
      moveStock(args),
    onSuccess: (newStock, vars) => {
      // Patch any cached products lists
      qc.getQueriesData<Product[]>({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "products" })
        .forEach(([key, list]) => {
          if (!list) return;
          const next = list.map(p => (p.id === vars.productId ? { ...p, stock: newStock } as Product : p));
          qc.setQueryData(key, next);
        });
      // Safety: invalidate all product lists too
      qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "products" });
    }
  });
}

export function useSetStock(paramsToInvalidate: ListParams = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { productId: string; newQty: number; reason?: string }) =>
      setStock(args.productId, args.newQty, args.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", paramsToInvalidate] });
      qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === "products" });
    }
  });
}


/** MOVEMENTS LIST */
export function useStockMovements(params: MovementsParams = {}) {
  return useQuery({
    queryKey: qkMovements(params),
    queryFn: () => listStockMovements(params),
    staleTime: 15_000
  });
}
