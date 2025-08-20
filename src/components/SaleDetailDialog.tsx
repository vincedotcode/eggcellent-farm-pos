import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { useSaleItems } from "@/features/sales/hooks";
import { fmtMoney } from "@/features/sales/utils";

export default function SaleDetailDialog({
  saleId, customerName, createdAt, trigger
}: {
  saleId: string;
  customerName: string | null;
  createdAt: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: items = [], isLoading } = useSaleItems(open ? saleId : null);

  const fallback = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  );

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = items.reduce((s, i) => s + i.price * i.quantity * (i.tax_rate / 100), 0);
  const total = subtotal + tax;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallback}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>
            #{saleId} • {new Date(createdAt).toLocaleString()} • {customerName ?? "Walk-in Customer"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading items…</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.product_name}</TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell className="text-right">{fmtMoney(it.price)}</TableCell>
                    <TableCell className="text-right">{it.tax_rate}%</TableCell>
                    <TableCell className="text-right">{fmtMoney(it.price * it.quantity * (1 + it.tax_rate/100))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span><span>{fmtMoney(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span><span>{fmtMoney(total)}</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
