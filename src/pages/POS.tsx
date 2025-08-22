import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, Receipt, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddCustomerDialog from "@/components/AddCustomerDialog";
import PaymentDialog from "@/components/PaymentDialog";
import { usePosProducts, usePosCustomers, useCheckout } from "@/features/pos/hooks";
import { useSalePaymentSummary } from "@/features/payments/hooks";
import type { CartItem } from "@/features/pos/types";
import { calcSubtotal, calcTax, calcTotal } from "@/features/pos/utils";

const POS = () => {
  const { toast } = useToast();

  // Data
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const { data: products = [], isLoading: loadingProducts, error: productsError } = usePosProducts(productSearch);
  const { data: customers = [], isLoading: loadingCustomers, error: customersError } = usePosCustomers(customerSearch);

  // Cart & customer
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const checkout = useCheckout();

  // Derived
  const subtotal = useMemo(() => calcSubtotal(cart), [cart]);
  const tax = useMemo(() => calcTax(cart), [cart]);
  const total = useMemo(() => calcTotal(cart), [cart]);

  const addToCart = (p: { id: string; name: string; price: number; tax_rate: number; stock: number }) => {
    if (p.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(i => i.product_id === p.id);
      if (existing) {
        // cap at available stock
        const desired = existing.quantity + 1;
        if (desired > p.stock) {
          toast({ title: "Insufficient stock", description: `Only ${p.stock} units available.`, variant: "destructive" });
          return prev;
        }
        return prev.map(i => i.product_id === p.id ? { ...i, quantity: desired } : i);
      }
      return [...prev, { product_id: p.id, name: p.name, price: p.price, tax_rate: p.tax_rate, stock: p.stock, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id !== productId) return item;
      const max = item.stock;
      const desired = item.quantity + delta;
      if (desired <= 0) return item; // filtered out below
      if (desired > max) {
        toast({ title: "Insufficient stock", description: `Only ${max} units available.`, variant: "destructive" });
        return item;
      }
      return { ...item, quantity: desired };
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before checkout.", variant: "destructive" });
      return;
    }
    if (!selectedCustomer) {
      toast({ title: "Customer required", description: "Select a customer (or Walk-in).", variant: "destructive" });
      return;
    }

    try {
      const isWalkIn = selectedCustomer === "walk-in";
      const { sale_id, subtotal, tax_amount, total } = await checkout.mutateAsync({
        customerId: selectedCustomer === "walk-in" ? null : selectedCustomer,
        cart,
        partialAmount: allowPartialPayment && partialAmount ? parseFloat(partialAmount) : null,
        note: null
      });
      

      if (allowPartialPayment && partialAmount) {
        const partialPaymentAmount = parseFloat(partialAmount);
        if (partialPaymentAmount > 0 && partialPaymentAmount < total) {
          toast({ 
            title: "Sale completed with partial payment", 
            description: `Sale #${sale_id} • Paid Rs ${partialPaymentAmount.toFixed(2)} of Rs ${total.toFixed(2)}. Balance due: Rs ${(total - partialPaymentAmount).toFixed(2)}` 
          });
        } else {
          toast({ title: "Sale completed", description: `Sale #${sale_id} • Total Rs ${total.toFixed(2)}` });
        }
      } else {
        toast({ title: "Sale completed", description: `Sale #${sale_id} • Total Rs ${total.toFixed(2)}` });
      }
      
      setCart([]);
      setPartialAmount("");
      setAllowPartialPayment(false);
    } catch (e: any) {
      toast({
        title: "Checkout failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive"
      });
    }
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
            <div className="relative max-w-md mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search products..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadingProducts && <div className="text-sm text-muted-foreground p-2">Loading products…</div>}
            {productsError && <div className="text-sm text-destructive p-2">Failed to load products.</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        <p className="text-lg font-bold text-primary">Rs {Number(product.price).toFixed(2)}</p>
                      </div>
                      <Button onClick={() => addToCart(product)} size="sm" disabled={product.stock === 0}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!loadingProducts && products.length === 0) && (
                <div className="text-sm text-muted-foreground p-2">No products available.</div>
              )}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <div className="flex gap-2">
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddCustomerDialog
                  isQuickAdd
                  trigger={<Button variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>}
                  onCustomerAdded={(customer) => {
                    toast({ title: "Customer added", description: `${customer.name} selected.` });
                    setSelectedCustomer(customer.id.toString());
                  }}
                />
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search customers…"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-2">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rs {item.price.toFixed(2)} each • Tax {item.tax_rate}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product_id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.product_id, +1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeFromCart(item.product_id)}>
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
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>Rs {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>
                
                {/* Partial Payment Option */}
                <div className="border-t pt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partialPayment"
                      checked={allowPartialPayment}
                      onChange={(e) => setAllowPartialPayment(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="partialPayment" className="text-sm font-medium">
                      Allow Partial Payment
                    </label>
                  </div>
                  
                  {allowPartialPayment && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Payment Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={total}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder={`Max: Rs ${total.toFixed(2)}`}
                      />
                      {partialAmount && parseFloat(partialAmount) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Balance due: Rs {(total - parseFloat(partialAmount)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              className="w-full"
              disabled={cart.length === 0 || !selectedCustomer || checkout.isPending}
            >
              <Receipt className="mr-2 h-4 w-4" />
              {checkout.isPending ? "Processing…" : "Checkout"}
            </Button>

            {(loadingCustomers || loadingProducts) && (
              <div className="text-xs text-muted-foreground">Loading data…</div>
            )}
            {(customersError || productsError) && (
              <div className="text-xs text-destructive">
                {(customersError as any)?.message || (productsError as any)?.message || "Data load error"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POS;
