export type PosProduct = {
  id: string;
  name: string;
  price: number;
  tax_rate: number;
  stock: number;
};

export type PosCustomer = {
  id: string;
  name: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  tax_rate: number;
  stock: number;     // snapshot at selection time
  quantity: number;
};

export type CheckoutResponse = {
  sale_id: string;
  subtotal: number;
  tax_amount: number;
  total: number;
};

export type CheckoutArgs = {
  customerId: string | null;   // null => Walk-in
  cart: CartItem[];
  partialAmount?: number | null;
  note?: string | null;
};
