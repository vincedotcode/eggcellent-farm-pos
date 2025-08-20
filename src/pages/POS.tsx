import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, User, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddCustomerDialog from "@/components/AddCustomerDialog";

const POS = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const { toast } = useToast();

  // Sample products
  const products = [
    { id: 1, name: "Grade A Large Eggs", price: 2.99, stock: 1250, tax: 8.5 },
    { id: 2, name: "Grade AA Medium Eggs", price: 2.79, stock: 45, tax: 8.5 },
    { id: 3, name: "Free Range Large Eggs", price: 4.49, stock: 890, tax: 8.5 },
    { id: 4, name: "Duck Eggs Large", price: 6.99, stock: 25, tax: 8.5 }
  ];

  // Sample customers with addresses
  const customers = [
    { id: "1", name: "Fresh Mart Grocery", address: "123 Market Street, Downtown, CA 90210" },
    { id: "2", name: "Sunny Side Cafe", address: "456 Oak Avenue, Uptown, CA 90211" },
    { id: "3", name: "Metro Restaurant Group", address: "789 Business Blvd, Metro City, CA 90212" },
    { id: "walk-in", name: "Walk-in Customer", address: "N/A" }
  ];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity * item.tax / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Customer required",
        description: "Please select a customer before checkout",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Checkout requires Supabase",
      description: "Connect to Supabase to process sales and generate invoices",
      variant: "destructive"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Process customer transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        <p className="text-lg font-bold text-primary">${product.price}</p>
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        size="sm"
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="text-sm font-medium">Customer</label>
              <div className="flex gap-2">
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddCustomerDialog 
                  isQuickAdd={true}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                  onCustomerAdded={(customer) => {
                    toast({
                      title: "Customer added",
                      description: `${customer.name} has been added and selected.`,
                    });
                    setSelectedCustomer(customer.id.toString());
                  }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-2">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              className="w-full"
              disabled={cart.length === 0 || !selectedCustomer}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POS;