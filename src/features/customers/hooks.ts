import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listCustomers, createCustomer, updateCustomer, deleteCustomer, ListParams } from "./api";
import type { Customer, CustomerInsert } from "./types";

const qk = (params: ListParams) => ["customers", params] as const;

export function useCustomers(params: ListParams) {
  return useQuery({
    queryKey: qk(params),
    queryFn: () => listCustomers(params),
    staleTime: 30_000
  });
}

export function useCreateCustomer(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerInsert) => createCustomer(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}

export function useUpdateCustomer(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CustomerInsert> }) =>
      updateCustomer(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}

export function useDeleteCustomer(paramsToInvalidate: ListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(paramsToInvalidate) })
  });
}
