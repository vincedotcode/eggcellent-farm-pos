import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSales, useSalesMetrics } from "@/features/sales/hooks";
import { fmtMoney, shortId, toExclusiveEnd, toISOStart, paymentStatus } from "@/features/sales/utils";
import { FileText, TrendingUp, DollarSign, CalendarRange, Eye, Search } from "lucide-react";
import SaleDetailDialog from "@/components/SaleDetailDialog";

const PAGE_SIZE = 100;

export default function Sales() {
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const params = useMemo(() => ({
    query,
    dateFrom: toISOStart(dateFrom),
    dateTo: toExclusiveEnd(dateTo),
    limit: PAGE_SIZE,
    offset: 0
  }), [query, dateFrom, dateTo]);

  const { data: rows = [], isLoading, isError, error } = useSales(params);
  const { data: metrics } = useSalesMetrics(7);

  const today = new Date().toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* header + KPIs unchanged ... */}

      {/* Filters unchanged ... */}

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-sm text-muted-foreground p-2">Loading sales…</div>}
          {isError && <div className="text-sm text-destructive p-2">{(error as any)?.message || "Failed to load sales."}</div>}

          {(!isLoading && rows.length === 0) ? (
            <div className="text-sm text-muted-foreground p-2">No sales found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {/* NEW */}
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const status = paymentStatus(r.total, r.paid_total);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{shortId(r.id)}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.customer_name ?? "Walk-in Customer"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{r.item_count}</TableCell>
                      <TableCell className="text-right">{fmtMoney(r.subtotal)}</TableCell>
                      <TableCell className="text-right">{fmtMoney(r.tax_amount)}</TableCell>
                      <TableCell className="text-right font-semibold">{fmtMoney(r.total)}</TableCell>
                      {/* NEW */}
                      <TableCell className="text-right">{fmtMoney(r.paid_total)}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        r.balance_due > 0.01 ? "text-red-600" : "text-green-600"
                      }`}>
                        {fmtMoney(r.balance_due)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "paid" ? "default" :
                            status === "partial" ? "secondary" : "destructive"
                          }
                        >
                          {status === "paid" ? "Paid" : status === "partial" ? "Partial" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
           <SaleDetailDialog
  saleId={r.id}
  customerId={r.customer_id}               
  customerName={r.customer_name}
  createdAt={r.created_at}
  saleTotal={r.total}
  paidTotal={r.paid_total}                 
  balanceDue={r.balance_due}                
  trigger={
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  }
/>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
