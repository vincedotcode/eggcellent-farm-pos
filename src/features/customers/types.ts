export type CustomerType = 'Retail' | 'Wholesale' | 'Restaurant' | 'Grocery';

export type CustomerInsert = {
  name: string;
  email?: string | null;
  phone?: string | null;
  type?: CustomerType;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  notes?: string | null;
  status?: 'Active' | 'Inactive';
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: CustomerType;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  total_orders?: number;
  total_spent?: number;
};
