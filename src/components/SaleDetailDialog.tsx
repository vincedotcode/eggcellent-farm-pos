import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Download } from "lucide-react";
import { useSaleItems } from "@/features/sales/hooks";
import { useSalePaymentSummary, useSalePayments } from "@/features/payments/hooks";
import { fmtMoney } from "@/features/sales/utils";

export default function SaleDetailDialog({
  saleId, customerName, createdAt, trigger, saleTotal
}: {
  saleId: string;
  customerName: string | null;
  createdAt: string;
  saleTotal: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: items = [], isLoading } = useSaleItems(open ? saleId : null);
  const { data: paymentSummary } = useSalePaymentSummary(open ? saleId : null);
  const { data: payments = [] } = useSalePayments(open ? saleId : null);

  const fallback = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  );

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = items.reduce((s, i) => s + i.price * i.quantity * (i.tax_rate / 100), 0);
  const calculatedTotal = subtotal + tax;
  
  const totalPaid = paymentSummary?.total_paid || 0;
  const balance = saleTotal - totalPaid;
  const isPaid = balance <= 0.01;

  const downloadInvoice = () => {
    const invoiceData = {
      saleId,
      date: new Date(createdAt).toLocaleDateString(),
      customer: customerName || "Walk-in Customer",
      items,
      subtotal,
      tax,
      total: calculatedTotal,
      totalPaid,
      balance,
      payments
    };
    
    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `invoice-${saleId.slice(0, 8)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? fallback}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Sale Details - #{saleId.slice(0, 8)}</span>
            <div className="flex gap-2">
              <Badge variant={isPaid ? "default" : "destructive"}>
                {isPaid ? "Paid" : "Outstanding"}
              </Badge>
              {isPaid && (
                <Button size="sm" variant="outline" onClick={downloadInvoice}>
                  <Download className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {new Date(createdAt).toLocaleString()} • {customerName ?? "Walk-in Customer"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading sale details…</div>
        ) : (
          <div className="space-y-6">
            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Items Sold</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <TableCell className="font-medium">{it.product_name}</TableCell>
                        <TableCell className="text-right">{it.quantity}</TableCell>
                        <TableCell className="text-right">{fmtMoney(it.price)}</TableCell>
                        <TableCell className="text-right">{it.tax_rate}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {fmtMoney(it.price * it.quantity * (1 + it.tax_rate/100))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sale Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sale Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{fmtMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{fmtMoney(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{fmtMoney(calculatedTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount</span>
                    <span>{fmtMoney(saleTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Amount Paid</span>
                    <span className="text-green-600">{fmtMoney(totalPaid)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Balance</span>
                    <span className={balance > 0.01 ? "text-red-600" : "text-green-600"}>
                      {fmtMoney(balance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.payment_method}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {fmtMoney(payment.amount_paid)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}