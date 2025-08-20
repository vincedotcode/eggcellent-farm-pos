import { supabase } from "@/lib/supabase";
import type { Customer, CustomerInsert } from "./types";

export type ListParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listCustomers(params: ListParams = {}): Promise<Customer[]> {
  const { search = "", limit = 50, offset = 0 } = params;

  // Prefer RPC for server-side filtering + stats
  const { data, error } = await supabase.rpc("customers_search", {
    p_query: search ? search : null,
    p_limit: limit,
    p_offset: offset
  });

  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function createCustomer(payload: CustomerInsert): Promise<Customer> {
  const insert = {
    name: payload.name,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    type: payload.type ?? "Retail",
    address: payload.address ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    zip_code: payload.zip_code ?? null,
    notes: payload.notes ?? null,
    status: payload.status ?? "Active"
  };

  const { data, error } = await supabase
    .from("customers")
    .insert([insert])
    .select("*")
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, patch: Partial<CustomerInsert>): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error; // RLS enforces admin-only delete; error if not admin
}
