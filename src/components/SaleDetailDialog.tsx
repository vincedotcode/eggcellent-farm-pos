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

// ✨ NEW
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Method = "Cash" | "Card" | "Check" | "Bank Transfer";

const STORE = {
  name: "EggPro ERP",
  address: "Main Road, Your City",
  phone: "+230 0000000",
  email: "billing@eggpro.example"
};

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
  customerId?: string | null;
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

  /** ---------- PDF HELPERS (invoice & receipt) ---------- */

  const invoicePdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.text("INVOICE", 14, 16);
    doc.setFontSize(10);
    doc.text(STORE.name, 14, 24);
    doc.text(STORE.address, 14, 29);
    doc.text(`${STORE.phone} • ${STORE.email}`, 14, 34);

    const right = (txt: string, y: number) => doc.text(txt, pageWidth - 14, y, { align: "right" });
    right(`Invoice #${saleId.slice(0, 8)}`, 16);
    right(new Date(createdAt).toLocaleString(), 22);
    right(isPaid ? "Status: PAID" : "Status: DUE", 28);

    // Customer block
    doc.setFontSize(11);
    doc.text("Bill To:", 14, 44);
    doc.setFontSize(10);
    doc.text(customerName ?? "Walk-in Customer", 14, 50);

    // Items table
    const itemRows = items.map(i => ([
      i.product_name,
      String(i.quantity),
      fmtMoney(i.price),
      `${i.tax_rate}%`,
      fmtMoney(i.price * i.quantity * (1 + i.tax_rate / 100)),
    ]));

    autoTable(doc, {
      startY: 58,
      head: [["Item", "Qty", "Price", "Tax %", "Line Total"]],
      body: itemRows,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [245, 245, 245], textColor: 0 },
      columnStyles: {
        1: { halign: "right", cellWidth: 18 },
        2: { halign: "right", cellWidth: 28 },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "right", cellWidth: 32 },
      }
    });

    let y = (doc as any).lastAutoTable.finalY || 58;

    // Totals
    y += 6;
    doc.setFontSize(10);
    right(`Subtotal: ${fmtMoney(subtotal)}`, y); y += 6;
    right(`Tax: ${fmtMoney(tax)}`, y); y += 6;
    doc.setFontSize(12);
    right(`Total: ${fmtMoney(calculatedTotal)}`, y); y += 7;
    doc.setFontSize(10);
    right(`Paid: ${fmtMoney(totalPaid)}`, y); y += 6;
    doc.setDrawColor(200);
    doc.line(pageWidth - 70, y, pageWidth - 14, y);
    y += 6;
    doc.setFontSize(12);
    right(`Balance: ${fmtMoney(Math.max(calculatedTotal - totalPaid, 0))}`, y);
    y += 10;

    // Payments table (optional)
    if (payments.length) {
      doc.setFontSize(11);
      doc.text("Payments", 14, y); y += 4;

      const payRows = payments.map(p => ([
        new Date(p.payment_date).toLocaleString(),
        p.payment_method,
        fmtMoney(p.amount_paid),
        p.notes ?? ""
      ]));

      autoTable(doc, {
        startY: y,
        head: [["Date", "Method", "Amount", "Notes"]],
        body: payRows,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          2: { halign: "right", cellWidth: 24 },
        }
      });
      y = (doc as any).lastAutoTable.finalY || y;
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setFontSize(9);
    doc.text("Thank you for your business!", 14, footerY);

    doc.save(`invoice-${saleId.slice(0, 8)}.pdf`);
  };

  const receiptPdf = () => {
    // 80mm thermal-style receipt
    const width = 80; // mm
    const dynamicHeight = Math.max(140, 70 + items.length * 6 + payments.length * 6);
    const doc = new jsPDF({ unit: "mm", format: [width, dynamicHeight] });

    let y = 8;
    const center = (txt: string, yy: number, size = 10) => {
      doc.setFontSize(size);
      doc.text(txt, width / 2, yy, { align: "center" });
    };
    const row = (label: string, value: string) => {
      doc.setFontSize(9);
      doc.text(label, 6, y);
      doc.text(value, width - 6, y, { align: "right" });
      y += 5;
    };
    const rule = () => { doc.setDrawColor(220); doc.line(6, y, width - 6, y); y += 3; };

    center(STORE.name, y, 12); y += 5;
    center(STORE.address, y); y += 4;
    center(`${STORE.phone} • ${STORE.email}`, y); y += 6;

    center("RECEIPT", y, 11); y += 6;
    row("Sale #", saleId.slice(0, 8));
    row("Date", new Date(createdAt).toLocaleString());
    row("Customer", customerName ?? "Walk-in");
    rule();

    // Items (compact)
    doc.setFontSize(9);
    items.forEach(i => {
      doc.text(i.product_name, 6, y); y += 4;
      const line = `${i.quantity} × ${fmtMoney(i.price)}  Tax ${i.tax_rate}%`;
      doc.text(line, 6, y);
      const lineTotal = fmtMoney(i.price * i.quantity * (1 + i.tax_rate / 100));
      doc.text(lineTotal, width - 6, y, { align: "right" });
      y += 5;
    });
    rule();

    row("Subtotal", fmtMoney(subtotal));
    row("Tax", fmtMoney(tax));
    doc.setFontSize(10);
    row("Total", fmtMoney(calculatedTotal));
    row("Paid", fmtMoney(totalPaid));
    rule();
    doc.setFontSize(11);
    row("Balance", fmtMoney(Math.max(calculatedTotal - totalPaid, 0)));
    rule();

    // Last payment (if any)
    if (payments.length) {
      const latest = payments[0];
      doc.setFontSize(9);
      doc.text("Latest Payment:", 6, y); y += 4;
      row("Date", new Date(latest.payment_date).toLocaleString());
      row("Method", latest.payment_method);
      row("Amount", fmtMoney(latest.amount_paid));
      if (latest.notes) { doc.text(latest.notes, 6, y); y += 5; }
      rule();
    }

    center("Thank you!", y + 2);
    doc.save(`receipt-${saleId.slice(0, 8)}.pdf`);
  };

  const onDownloadInvoice = () => invoicePdf();
  const onDownloadReceipt = () => receiptPdf();

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
              {/* ⬇️ Hooked up to PDF now */}
              <Button size="sm" variant="outline" onClick={onDownloadInvoice}>
                <Download className="h-4 w-4 mr-1" />
                Invoice (PDF)
              </Button>
              <Button size="sm" variant="outline" onClick={onDownloadReceipt}>
                <Download className="h-4 w-4 mr-1" />
                Receipt (PDF)
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
