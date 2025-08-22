// src/components/SaleDetailDialog.tsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Download } from "lucide-react";
import { useSaleItems } from "@/features/sales/hooks";
import { useSalePaymentSummary, useSalePayments, useAddPayment } from "@/features/payments/hooks";
import { fmtMoney } from "@/features/sales/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Method = "Cash" | "Card" | "Check" | "Bank Transfer";

export default function SaleDetailDialog({
  saleId,
  customerId,
  customerName,
  createdAt,
  saleTotal,
  paidTotal: paidFromRow,
  balanceDue: balanceFromRow,
  trigger
}: {
  saleId: string;
  customerId?: string | null;            // NEW: required for payments
  customerName: string | null;
  createdAt: string;
  saleTotal: number;
  paidTotal?: number;
  balanceDue?: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: items = [], isLoading } = useSaleItems(open ? saleId : null);
  const { data: paymentSummary } = useSalePaymentSummary(open ? saleId : null);
  const { data: payments = [] } = useSalePayments(open ? saleId : null);
  const addPayment = useAddPayment();

  const fallback = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  );

  // Totals from items
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const tax = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity * (i.tax_rate / 100), 0), [items]);
  const calculatedTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  // Payment lens
  const totalPaid = paymentSummary?.total_paid ?? paidFromRow ?? 0;
  const balance = typeof balanceFromRow === "number" ? balanceFromRow : Math.max(saleTotal - totalPaid, 0);
  const isPaid = balance <= 0.01;

  /** ---------- Payment form ---------- */
  const [method, setMethod] = useState<Method>("Cash");
  const [amountStr, setAmountStr] = useState("");
  const [notes, setNotes] = useState("");

  const payBalanceQuick = () => setAmountStr((Math.max(balance, 0)).toFixed(2));

  const submitPayment = async () => {
    const amt = parseFloat(amountStr);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter a positive payment amount.", variant: "destructive" });
      return;
    }
    if (amt > balance + 0.01) {
      toast({ title: "Too much", description: "Payment cannot exceed the balance due.", variant: "destructive" });
      return;
    }
    try {
      await addPayment.mutateAsync({
        sale_id: saleId,
        customer_id: customerId ?? null,
        amount_paid: amt,
        payment_method: method,
        notes: notes || null
      });
      toast({ title: "Payment recorded", description: `Received ${fmtMoney(amt)} (${method}).` });
      setAmountStr("");
      setNotes("");
    } catch (e: any) {
      toast({ title: "Payment failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  /** ---------- Downloads ---------- */
  function downloadHTML(filename: string, html: string) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function invoiceHTML() {
    const rows = items.map(i => `
      <tr>
        <td>${i.product_name}</td>
        <td style="text-align:right">${i.quantity}</td>
        <td style="text-align:right">${fmtMoney(i.price)}</td>
        <td style="text-align:right">${i.tax_rate}%</td>
        <td style="text-align:right">${fmtMoney(i.price * i.quantity * (1 + i.tax_rate/100))}</td>
      </tr>`).join("");

    const payRows = payments.map(p => `
      <tr>
        <td>${new Date(p.payment_date).toLocaleString()}</td>
        <td>${p.payment_method}</td>
        <td style="text-align:right">${fmtMoney(p.amount_paid)}</td>
        <td>${p.notes ?? ""}</td>
      </tr>`).join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice #${saleId.slice(0,8)}</title>
<style>
  body{font-family:Inter,system-ui,Arial,sans-serif;padding:24px;color:#111827}
  h1{margin:0 0 8px 0} .muted{color:#6b7280}
  table{border-collapse:collapse;width:100%} th,td{padding:8px;border-bottom:1px solid #eee}
  .right{text-align:right} .total{font-weight:700}
  .card{border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px}
</style>
</head>
<body>
  <h1>Invoice <span class="muted">#${saleId.slice(0,8)}</span></h1>
  <div class="muted">${new Date(createdAt).toLocaleString()} • ${customerName ?? "Walk-in Customer"}</div>

  <div class="card">
    <table>
      <thead>
        <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Tax %</th><th class="right">Line Total</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <table style="margin-top:12px">
      <tbody>
        <tr><td>Subtotal</td><td class="right">${fmtMoney(subtotal)}</td></tr>
        <tr><td>Tax</td><td class="right">${fmtMoney(tax)}</td></tr>
        <tr><td class="total">Total</td><td class="right total">${fmtMoney(calculatedTotal)}</td></tr>
        <tr><td>Paid</td><td class="right">${fmtMoney(totalPaid)}</td></tr>
        <tr><td>Balance</td><td class="right">${fmtMoney(Math.max(calculatedTotal - totalPaid, 0))}</td></tr>
      </tbody>
    </table>
  </div>

  ${payments.length ? `
  <div class="card">
    <h3>Payments</h3>
    <table>
      <thead><tr><th>Date</th><th>Method</th><th class="right">Amount</th><th>Notes</th></tr></thead>
      <tbody>${payRows}</tbody>
    </table>
  </div>` : ""}

</body>
</html>`;
  }

  function receiptHTML() {
    const latest = payments[0];
    const paidNow = latest ? latest.amount_paid : totalPaid;
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt #${saleId.slice(0,8)}</title>
<style>
  body{font-family:Inter,system-ui,Arial,sans-serif;padding:24px;color:#111827}
  .muted{color:#6b7280}
  .row{display:flex;justify-content:space-between;margin:6px 0}
  .big{font-size:18px;font-weight:700}
  .card{border:1px solid #eee;border-radius:12px;padding:16px;margin-top:16px}
</style>
</head>
<body>
  <div class="big">Receipt</div>
  <div class="muted">Sale #${saleId.slice(0,8)} • ${new Date(createdAt).toLocaleString()}</div>
  <div class="muted">${customerName ?? "Walk-in Customer"}</div>

  <div class="card">
    <div class="row"><div>Total</div><div>${fmtMoney(saleTotal)}</div></div>
    <div class="row"><div>Paid ${latest ? `(latest)` : ``}</div><div>${fmtMoney(paidNow)}</div></div>
    <div class="row"><div>Balance</div><div>${fmtMoney(Math.max(saleTotal - totalPaid, 0))}</div></div>
  </div>
</body>
</html>`;
  }

  const onDownloadInvoice = () => downloadHTML(`invoice-${saleId.slice(0,8)}.html`, invoiceHTML());
  const onDownloadReceipt = () => downloadHTML(`receipt-${saleId.slice(0,8)}.html`, receiptHTML());

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
              <Button size="sm" variant="outline" onClick={onDownloadInvoice}>
                <Download className="h-4 w-4 mr-1" />
                Invoice
              </Button>
              <Button size="sm" variant="outline" onClick={onDownloadReceipt}>
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
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
            {/* Items */}
            <Card>
              <CardHeader><CardTitle>Items Sold</CardTitle></CardHeader>
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
                    {items.map(it => (
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

            {/* Summary + Payment status */}
            <div className="grid md:grid-cols-1">
              

              <Card>
                <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Total Amount</span><span>{fmtMoney(saleTotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>Amount Paid</span><span className="text-green-600">{fmtMoney(totalPaid)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Balance</span>
                    <span className={balance > 0.01 ? "text-red-600" : "text-green-600"}>{fmtMoney(balance)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Take a payment */}
            {!isPaid && (
              <Card>
                <CardHeader><CardTitle>Collect Payment</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Amount</label>
                      <Input type="number" min="0" step="0.01" value={amountStr} onChange={(e)=>setAmountStr(e.target.value)} />
                    </div>
                    <div className="w-full md:w-56">
                      <label className="text-xs text-muted-foreground">Method</label>
                      <Select value={method} onValueChange={(v)=>setMethod(v as Method)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Notes</label>
                    <Input value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Optional note…" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={submitPayment} disabled={addPayment.isPending}>Record Payment</Button>
                    <Button variant="outline" onClick={payBalanceQuick}>Pay Balance ({fmtMoney(balance)})</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment history */}
            {payments.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
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
                      {payments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{new Date(p.payment_date).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline">{p.payment_method}</Badge></TableCell>
                          <TableCell className="text-right font-medium">{fmtMoney(p.amount_paid)}</TableCell>
                          <TableCell className="text-muted-foreground">{p.notes ?? "-"}</TableCell>
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
