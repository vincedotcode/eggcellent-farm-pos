import { supabase } from "@/lib/supabase";
import type { PosProduct, PosCustomer, CartItem, CheckoutArgs, CheckoutResponse } from "./types";

/** Products for POS (stock > 0) */
export async function fetchPosProducts(search = "", limit = 200): Promise<PosProduct[]> {
  const { data, error } = await supabase.rpc("pos_products", {
    p_query: search ? search : null,
    p_limit: limit,
    p_offset: 0
  });
  if (error) throw error;
  return (data ?? []) as PosProduct[];
}

/** Customers (id, name) */
export async function fetchPosCustomers(search = "", limit = 200): Promise<PosCustomer[]> {
  let q = supabase.from("customers").select("id,name").order("name", { ascending: true }).limit(limit);
  const { data, error } = search ? await q.ilike("name", `%${search}%`) : await q;
  if (error) throw error;
  return (data ?? []) as PosCustomer[];
}

/** Checkout sale */
export async function posCheckout(args: CheckoutArgs): Promise<CheckoutResponse> {
  const items = args.cart.map(ci => ({
    product_id: ci.product_id,
    quantity: ci.quantity
    // price/tax are sourced in DB to avoid tampering
  }));

  // If you provide a partial or note, call the _full variant; else use the 2-arg wrapper
  const hasExtras = (args.partialAmount ?? null) !== null || (args.note ?? null) !== null;

  const call2 = () => supabase.rpc("pos_checkout", {
    p_customer_id: args.customerId,
    p_items: items
  });

  const call4 = () => supabase.rpc("pos_checkout_full", {
    p_customer_id: args.customerId,
    p_items: items,
    p_partial_amount: args.partialAmount ?? null,
    p_note: args.note ?? null
  });

  const { data, error } = await (hasExtras ? call4() : call2());
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as any;
  return {
    sale_id: row.sale_id,
    subtotal: Number(row.subtotal),
    tax_amount: Number(row.tax_amount),
    total: Number(row.total),
  };
}
