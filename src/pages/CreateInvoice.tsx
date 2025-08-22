import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2, Save, FileText } from "lucide-react";

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  tax: number;
}

const CreateInvoice = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [invoiceData, setInvoiceData] = useState({
    customerId: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    terms: "Net 30"
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    price: 0,
    tax: 8.5
  });

  // Sample customers with addresses
  const customers = [
    {
      id: "1",
      name: "Fresh Mart Grocery",
      address: "123 Market Street",
      city: "Downtown",
      state: "CA",
      zipCode: "90210"
    },
    {
      id: "2",
      name: "Sunny Side Cafe",
      address: "456 Oak Avenue",
      city: "Uptown",
      state: "CA", 
      zipCode: "90211"
    },
    {
      id: "3",
      name: "Metro Restaurant Group",
      address: "789 Business Blvd",
      city: "Metro City",
      state: "CA",
      zipCode: "90212"
    }
  ];

  const addItem = () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) {
      toast({
        title: "Invalid item",
        description: "Please fill in all item details with valid values.",
        variant: "destructive"
      });
      return;
    }

    const item: InvoiceItem = {
      id: Date.now(),
      ...newItem
    };

    setItems([...items, item]);
    setNewItem({
      name: "",
      quantity: 1,
      price: 0,
      tax: 8.5
    });
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.price;
    const taxAmount = subtotal * (item.tax / 100);
    return subtotal + taxAmount;
  };

  const calculateInvoiceSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateInvoiceTax = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price * item.tax / 100), 0);
  };

  const calculateInvoiceTotal = () => {
    return calculateInvoiceSubtotal() + calculateInvoiceTax();
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this invoice.",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Items required",
        description: "Please add at least one item to the invoice.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual Supabase calls
      // const { data: invoice, error: invoiceError } = await supabase
      //   .from('invoices')
      //   .insert([{
      //     customer_id: invoiceData.customerId,
      //     invoice_date: invoiceData.invoiceDate,
      //     due_date: invoiceData.dueDate,
      //     subtotal: calculateInvoiceSubtotal(),
      //     tax_amount: calculateInvoiceTax(),
      //     total: calculateInvoiceTotal(),
      //     status: 'Pending',
      //     notes: invoiceData.notes,
      //     terms: invoiceData.terms
      //   }])
      //   .select()
      //   .single();

      // if (invoiceError) throw invoiceError;

      // const { error: itemsError } = await supabase
      //   .from('invoice_items')
      //   .insert(items.map(item => ({
      //     invoice_id: invoice.id,
      //     product_name: item.name,
      //     quantity: item.quantity,
      //     price: item.price,
      //     tax_rate: item.tax
      //   })));

      // if (itemsError) throw itemsError;

      toast({
        title: "Invoice created successfully",
        description: "The invoice has been saved and can be sent to the customer.",
      });

      // Reset form
      setInvoiceData({
        customerId: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        notes: "",
        terms: "Net 30"
      });
      setItems([]);

    } catch (error) {
      toast({
        title: "Error creating invoice",
        description: "There was a problem creating the invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === invoiceData.customerId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for manual sales entry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select
                    value={invoiceData.customerId}
                    onValueChange={(value) => setInvoiceData({ ...invoiceData, customerId: value })}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Payment Terms</Label>
                  <Select
                    value={invoiceData.terms}
                    onValueChange={(value) => setInvoiceData({ ...invoiceData, terms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  placeholder="Additional notes for this invoice..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Items */}
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newItem.tax}
                    onChange={(e) => setNewItem({ ...newItem, tax: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.tax}%</TableCell>
                        <TableCell>₹{calculateItemTotal(item).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoice Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Info */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">EggPro ERP</h2>
                <p className="text-sm text-muted-foreground">Egg Production & Sales</p>
                <p className="text-sm text-muted-foreground">123 Farm Road, Egg Valley, CA 90000</p>
              </div>

              {/* Customer Info */}
              {selectedCustomer && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Bill To:</h3>
                  <div className="text-sm">
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p>{selectedCustomer.address}</p>
                    <p>{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}</p>
                  </div>
                </div>
              )}

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Invoice Date:</strong></p>
                  <p>{invoiceData.invoiceDate}</p>
                </div>
                <div>
                  <p><strong>Due Date:</strong></p>
                  <p>{invoiceData.dueDate || "Not set"}</p>
                </div>
                <div>
                  <p><strong>Terms:</strong></p>
                  <p>{invoiceData.terms}</p>
                </div>
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{calculateInvoiceSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{calculateInvoiceTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{calculateInvoiceTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveInvoice}
                className="w-full"
                disabled={loading || !invoiceData.customerId || items.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Invoice"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;