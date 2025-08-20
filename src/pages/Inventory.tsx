import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, AlertTriangle, Package } from "lucide-react";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample inventory data
  const inventory = [
    {
      id: 1,
      name: "Grade A Large Eggs",
      sku: "EGG-A-L-001",
      category: "Fresh Eggs",
      stock: 1250,
      minStock: 500,
      price: 2.99,
      tax: 8.5,
      supplier: "Happy Hens Farm",
      description: "Premium grade A large white eggs, cage-free"
    },
    {
      id: 2,
      name: "Grade AA Medium Eggs",
      sku: "EGG-AA-M-002",
      category: "Fresh Eggs",
      stock: 45,
      minStock: 200,
      price: 2.79,
      tax: 8.5,
      supplier: "Happy Hens Farm",
      description: "Top quality grade AA medium eggs, organic"
    },
    {
      id: 3,
      name: "Free Range Large Eggs",
      sku: "EGG-FR-L-003",
      category: "Organic Eggs",
      stock: 890,
      minStock: 300,
      price: 4.49,
      tax: 8.5,
      supplier: "Green Pastures Co.",
      description: "Free-range large brown eggs, pasture-raised"
    },
    {
      id: 4,
      name: "Duck Eggs Large",
      sku: "DUCK-L-004",
      category: "Specialty Eggs",
      stock: 25,
      minStock: 50,
      price: 6.99,
      tax: 8.5,
      supplier: "Countryside Ducks",
      description: "Fresh duck eggs, rich and creamy texture"
    }
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock * 0.5) return "critical";
    if (stock <= minStock) return "low";
    return "good";
  };

  const getStockBadge = (stock: number, minStock: number) => {
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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
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
                <p className="text-2xl font-bold text-warning">
                  {inventory.filter(item => getStockStatus(item.stock, item.minStock) !== "good").length}
                </p>
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
                <p className="text-2xl font-bold">
                  ${inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString()}
                </p>
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
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{item.stock} units</div>
                      <div className="text-muted-foreground">Min: {item.minStock}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${item.price}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell>{getStockBadge(item.stock, item.minStock)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;