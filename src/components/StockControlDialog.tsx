import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/features/inventory/types";
import { getStockStatus } from "@/features/inventory/utils";

interface StockControlDialogProps {
  product: Product;
}

export default function StockControlDialog({ product }: StockControlDialogProps) {
  const [open, setOpen] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const { toast } = useToast();

  const handleStockAdjustment = () => {
    const adjustmentValue = parseFloat(adjustment);
    if (isNaN(adjustmentValue) || adjustmentValue <= 0) {
      toast({
        title: "Invalid adjustment",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the stock adjustment.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API to update stock
    const newStock = adjustmentType === "add" 
      ? product.stock + adjustmentValue
      : Math.max(0, product.stock - adjustmentValue);

    toast({
      title: "Stock updated",
      description: `${product.name} stock ${adjustmentType === "add" ? "increased" : "decreased"} by ${adjustmentValue} units. New stock: ${newStock}`,
    });

    setOpen(false);
    setAdjustment("");
    setReason("");
  };

  const stockStatus = getStockStatus(product.stock, product.min_stock);
  const stockValue = product.stock * product.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Control - {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Current Stock</Label>
                  <p className="text-2xl font-bold">{product.stock} units</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Minimum Stock</Label>
                  <p className="text-2xl font-bold text-warning">{product.min_stock} units</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Stock Value</Label>
                  <p className="text-xl font-semibold">₹{stockValue.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={
                      stockStatus === "critical" ? "destructive" :
                      stockStatus === "low" ? "secondary" : "default"
                    }>
                      {stockStatus === "critical" ? "Critical Low" :
                       stockStatus === "low" ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>
              </div>

              {stockStatus !== "good" && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Stock Alert</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stock is {stockStatus === "critical" ? "critically" : ""} low. 
                    Consider restocking soon to avoid stockouts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Adjustment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Adjustment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentType === "remove" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("remove")}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Stock
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Reason for Adjustment</Label>
                <Input
                  placeholder="e.g., Stock received, Damage, Sale correction..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {adjustment && !isNaN(parseFloat(adjustment)) && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {adjustmentType === "add" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-warning" />
                    )}
                    <span className="font-medium">Adjustment Preview</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span>{product.stock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adjustment:</span>
                      <span className={adjustmentType === "add" ? "text-success" : "text-warning"}>
                        {adjustmentType === "add" ? "+" : "-"}{parseFloat(adjustment)} units
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>New Stock:</span>
                      <span>
                        {adjustmentType === "add" 
                          ? product.stock + parseFloat(adjustment)
                          : Math.max(0, product.stock - parseFloat(adjustment))} units
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleStockAdjustment}
                className="w-full"
                disabled={!adjustment || !reason.trim()}
              >
                Apply Stock Adjustment
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}