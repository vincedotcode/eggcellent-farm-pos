import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign } from "lucide-react";
import { useAddPayment } from "@/features/payments/hooks";

interface PaymentDialogProps {
  saleId: string;
  customerId: string | null;
  customerName: string | null;
  balanceDue: number;
  trigger?: React.ReactNode;
  onPaymentAdded?: () => void;
}

const PaymentDialog = ({ saleId, customerId, customerName, balanceDue, trigger, onPaymentAdded }: PaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addPayment = useAddPayment();

  const [formData, setFormData] = useState({
    amount: balanceDue.toString(),
    paymentMethod: "Cash" as const,
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Payment amount must be greater than 0.",
          variant: "destructive",
        });
        return;
      }

      if (amount > balanceDue) {
        toast({
          title: "Amount exceeds balance",
          description: `Payment amount cannot exceed balance due of Rs ${balanceDue.toFixed(2)}.`,
          variant: "destructive",
        });
        return;
      }

      await addPayment.mutateAsync({
        sale_id: saleId,
        customer_id: customerId,
        amount_paid: amount,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null
      });

      toast({
        title: "Payment recorded",
        description: `Payment of Rs ${amount.toFixed(2)} has been recorded.`,
      });

      onPaymentAdded?.();
      setFormData({
        amount: "0.00",
        paymentMethod: "Cash",
        notes: ""
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error recording payment",
        description: error?.message ?? "There was a problem recording the payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <CreditCard className="mr-2 h-4 w-4" />
      Add Payment
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for {customerName || "Walk-in Customer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Balance Due: <span className="font-bold text-primary">Rs {balanceDue.toFixed(2)}</span></Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={balanceDue}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment reference, check number, etc..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;