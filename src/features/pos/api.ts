import { supabase } from "@/lib/supabase";
import type { PosProduct, PosCustomer, CartItem, CheckoutResponse } from "./types";

export async function fetchPosProducts(search = "", limit = 200): Promise<PosProduct[]> {
  // Use RPC for stock > 0 (fast path), fall back to products_search if you like
  const { data, error } = await supabase.rpc("pos_products", {
    p_query: search ? search : null,
    p_limit: limit,
    p_offset: 0
  });
  if (error) throw error;
  return (data ?? []) as PosProduct[];
}

export async function fetchPosCustomers(search = "", limit = 200): Promise<PosCustomer[]> {
  // For POS we just need id + name; use customers table directly
  const q = supabase
    .from("customers")
    .select("id,name")
    .order("name", { ascending: true })
    .limit(limit);

  const { data, error } = search
    ? await q.ilike("name", `%${search}%`)
    : await q;

  if (error) throw error;
  return (data ?? []) as PosCustomer[];
}

export async function checkoutSale(customerId: string | null, cart: CartItem[]): Promise<CheckoutResponse> {
  const items = cart.map(ci => ({
    product_id: ci.product_id,
    quantity: ci.quantity
    // price/tax_rate intentionally omitted; DB sources authoritative values
  }));

  const { data, error } = await supabase.rpc("pos_checkout", {
    p_customer_id: customerId,   // null for walk-in
    p_items: items
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    sale_id: row.sale_id,
    subtotal: Number(row.subtotal),
    tax_amount: Number(row.tax_amount),
    total: Number(row.total),
  };
}
