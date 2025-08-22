import { supabase } from "@/lib/supabase";
import type {
  Product, ProductInsert,
  ListParams, MovementsParams,
  StockMovement, UUID
} from "./types";

/** PRODUCTS */
export async function listProducts(params: ListParams = {}): Promise<Product[]> {
  const { search = "", limit = 100, offset = 0, lowStockOnly = false } = params;
  const { data, error } = await supabase.rpc("products_search", {
    p_query: search ? search : null,
    p_limit: limit,
    p_offset: offset,
    p_low_stock_only: lowStockOnly
  });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: ProductInsert): Promise<Product> {
  const payload = {
    name: input.name,
    sku: input.sku,
    category: input.category ?? null,
    stock: input.stock ?? 0,      // initial stock on create is allowed
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
  // Guardrail: do not let callers "set stock" here; use inventory_set instead
  const { stock, ...safePatch } = patch as any;

  const { data, error } = await supabase
    .from("products")
    .update(safePatch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Product;
}

/** STOCK MOVEMENTS */
// /src/features/inventory/api.ts
export async function moveStock(args: {
  productId: UUID;
  delta: number;
  reason?: string;
  refType?: string | null;
  refId?: UUID | null;
}): Promise<number> {
  const { productId, delta, reason = "adjustment", refType = null, refId = null } = args;
  const { data, error } = await supabase.rpc("inventory_move", {
    p_delta: delta,
    p_product_id: productId,
    p_reason: reason,
    p_ref_id: refId,
    p_ref_type: refType
  });
  if (error) throw error;
  // function returns integer, Supabase returns it directly as data
  return data as number;
}

export async function setStock(productId: UUID, newQty: number, reason = "set"): Promise<void> {
  const { error } = await supabase.rpc("inventory_set", {
    p_product_id: productId,
    p_new_qty: newQty,
    p_reason: reason
  });
  if (error) throw error;
}

// Backward-compat alias if you referenced adjustStock before
export const adjustStock = (productId: string, delta: number, reason = "adjustment") =>
  moveStock({ productId, delta, reason });

/** MOVEMENTS LIST */
export async function listStockMovements(params: MovementsParams = {}): Promise<StockMovement[]> {
  const { productId, limit = 100, offset = 0 } = params;

  let query = supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StockMovement[];
}
