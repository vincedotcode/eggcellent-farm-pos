import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useCreateProduct } from "@/features/inventory/hooks";

interface AddProductDialogProps {
  trigger?: React.ReactNode;
  paramsForInvalidate?: { search?: string; limit?: number; offset?: number };
}

const AddProductDialog = ({ trigger, paramsForInvalidate = { search: "", limit: 100, offset: 0 } }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const create = useCreateProduct(paramsForInvalidate);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    stock: 0,
    min_stock: 0,
    price: 0,
    tax_rate: 8.5,
    supplier: "",
    description: ""
  });

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90">
      <Plus className="mr-2 h-4 w-4" />
      Add Product
    </Button>
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name || !form.sku) {
        toast({ title: "Missing fields", description: "Name and SKU are required.", variant: "destructive" });
        return;
      }

      await create.mutateAsync({
        name: form.name,
        sku: form.sku,
        category: form.category || null,
        stock: Number(form.stock) || 0,
        min_stock: Number(form.min_stock) || 0,
        price: Number(form.price) || 0,
        tax_rate: Number(form.tax_rate) || 0,
        supplier: form.supplier || null,
        description: form.description || null
      });

      toast({ title: "Product added", description: `${form.name} has been created.` });
      setForm({ name: "", sku: "", category: "", stock: 0, min_stock: 0, price: 0, tax_rate: 8.5, supplier: "", description: "" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Define the product, starting stock, and thresholds.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input id="stock" type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Min Stock</Label>
              <Input id="min_stock" type="number" min={0} value={form.min_stock} onChange={e => setForm({ ...form, min_stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" min={0} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax %</Label>
              <Input id="tax_rate" type="number" step="0.1" min={0} value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
