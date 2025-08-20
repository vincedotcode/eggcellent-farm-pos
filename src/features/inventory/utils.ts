export type StockStatus = "critical" | "low" | "good";

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= Math.max(0, Math.floor(minStock * 0.5))) return "critical";
  if (stock <= minStock) return "low";
  return "good";
}

export function totalStockValue(list: { stock: number; price: number }[]) {
  return list.reduce((sum, p) => sum + (p.stock * p.price), 0);
}

export function lowStockCount(list: { stock: number; min_stock: number }[]) {
  return list.filter(p => getStockStatus(p.stock, p.min_stock) !== "good").length;
}
