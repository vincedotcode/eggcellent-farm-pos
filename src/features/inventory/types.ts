export type ProductInsert = {
    name: string;
    sku: string;
    category?: string | null;
    stock?: number;       // initial
    min_stock?: number;
    price?: number;
    tax_rate?: number;    // percent (e.g., 8.5)
    supplier?: string | null;
    description?: string | null;
  };
  
  export type Product = {
    id: string;
    name: string;
    sku: string;
    category: string | null;
    stock: number;
    min_stock: number;
    price: number;
    tax_rate: number;
    supplier: string | null;
    description: string | null;
    created_at: string;
  };
  