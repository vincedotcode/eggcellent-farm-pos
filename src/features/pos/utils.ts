import type { CartItem } from "./types";

export function calcSubtotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
export function calcTax(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.price * i.quantity * (i.tax_rate / 100), 0);
}
export function calcTotal(cart: CartItem[]) {
  return calcSubtotal(cart) + calcTax(cart);
}
