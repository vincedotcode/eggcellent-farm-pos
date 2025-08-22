export type UUID = string;

export type ProductInsert = {
  name: string;
  sku: string;
  category?: string | null;
  stock?: number;           // initial stock on create; mutations go via movements
  min_stock?: number;
  price?: number;           // numeric(10,2)
  tax_rate?: number;        // numeric(5,2)
  supplier?: string | null;
  description?: string | null;
};

export type Product = {
  id: UUID;
  name: string;
  sku: string;
  category: string | null;
  stock: number;
  min_stock: number;
  price: number;
  tax_rate: number;
  supplier: string | null;
  description: string | null;
  created_at: string | null;
  created_by?: UUID | null;
};

export type StockMovement = {
  id: UUID;
  product_id: UUID | null;
  change: number;           // +in / -out
  reason: string | null;    // 'sale' | 'return' | 'purchase' | 'adjustment' | ...
  ref_type: string | null;  // e.g., 'sale','invoice','manual'
  ref_id: UUID | null;      // external row id if any
  created_at: string | null;
  created_by: UUID | null;
};

export type ListParams = {
  search?: string;
  limit?: number;
  offset?: number;
  lowStockOnly?: boolean;
};

export type MovementsParams = {
  productId?: UUID;         // filter by product
  limit?: number;
  offset?: number;
};

export type StockStatus = "critical" | "low" | "good";
