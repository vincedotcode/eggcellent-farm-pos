import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, AlertTriangle, Package } from "lucide-react";
import { useProducts } from "@/features/inventory/hooks";
import { getStockStatus, lowStockCount, totalStockValue } from "@/features/inventory/utils";
import type { Product } from "@/features/inventory/types";
import AddProductDialog from "@/components/AddProductDialog";

const PAGE_SIZE = 500;

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const params = useMemo(() => ({ search: searchTerm, limit: PAGE_SIZE, offset: 0 }), [searchTerm]);

  const { data, isLoading, isError, error } = useProducts(params);
  const inventory: Product[] = data ?? [];

  const lowCount = lowStockCount(inventory);
  const totalValue = totalStockValue(inventory);

  const stockBadge = (stock: number, minStock: number) => {
    const status = getStockStatus(stock, minStock);
    if (status === "critical") return <Badge variant="destructive">Critical</Badge>;
    if (status === "low") return <Badge variant="outline" className="border-warning text-warning">Low Stock</Badge>;
    return <Badge variant="default" className="bg-success">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your egg inventory</p>
        </div>
        <AddProductDialog paramsForInvalidate={params} />
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-warning">{lowCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Total Stock Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading products…</div>}
          {isError && <div className="p-4 text-sm text-destructive">{(error as any)?.message || "Failed to load products."}</div>}

          {!isLoading && inventory.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category || "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.stock} units</div>
                        <div className="text-muted-foreground">Min: {item.min_stock}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>{Number(item.tax_rate).toFixed(1)}%</TableCell>
                    <TableCell>{stockBadge(item.stock, item.min_stock)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && inventory.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
