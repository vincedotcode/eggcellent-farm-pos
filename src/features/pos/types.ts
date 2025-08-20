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
    stock: number;     // current available (snapshot)
    quantity: number;
  };
  
  export type CheckoutResponse = {
    sale_id: string;
    subtotal: number;
    tax_amount: number;
    total: number;
  };
  