import { supabase } from "@/lib/supabase";
import type { Product, ProductInsert } from "./types";

export type ListParams = { search?: string; limit?: number; offset?: number };

export async function listProducts(params: ListParams = {}): Promise<Product[]> {
  const { search = "", limit = 100, offset = 0 } = params;
  const { data, error } = await supabase.rpc("products_search", {
    p_query: search ? search : null,
    p_limit: limit,
    p_offset: offset
  });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: ProductInsert): Promise<Product> {
  const payload = {
    name: input.name,
    sku: input.sku,
    category: input.category ?? null,
    stock: input.stock ?? 0,            // initial stock allowed
    min_stock: input.min_stock ?? 0,
    price: input.price ?? 0,
    tax_rate: input.tax_rate ?? 0,
    supplier: input.supplier ?? null,
    description: input.description ?? null,
  };

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select("*")
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, patch: Partial<ProductInsert>): Promise<Product> {
  // NOTE: Non-admin updates that change 'stock' will be rejected by trigger.
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Product;
}

// Admin-only: adjust stock via RPC to keep audit trail
export async function adjustStock(productId: string, delta: number, reason = "adjustment"): Promise<void> {
  const { error } = await supabase.rpc("inventory_adjust", {
    p_product_id: productId,
    p_delta: delta,
    p_reason: reason
  });
  if (error) throw error;
}
