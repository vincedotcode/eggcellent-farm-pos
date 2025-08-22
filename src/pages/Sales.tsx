import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSales, useSalesMetrics } from "@/features/sales/hooks";
import { fmtMoney, shortId, toExclusiveEnd, toISOStart } from "@/features/sales/utils";
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
      <div>
        <h1 className="text-3xl font-bold">Sales</h1>
        <p className="text-muted-foreground">All POS sales with filters and KPIs</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales (Last 7d)</p>
                <p className="text-2xl font-bold">{metrics?.sales_count_7d ?? 0}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Last 7d)</p>
                <p className="text-2xl font-bold text-primary">{fmtMoney(metrics?.revenue_7d ?? 0)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AOV (Last 7d)</p>
                <p className="text-2xl font-bold">{fmtMoney(metrics?.aov_7d ?? 0)}</p>
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today ({today})</p>
                <p className="text-lg font-semibold">
                  {fmtMoney(metrics?.revenue_today ?? 0)} <span className="text-sm text-muted-foreground">/ {metrics?.sales_today ?? 0} sales</span>
                </p>
              </div>
              <CalendarRange className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by customer or sale id…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Date from</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Date to</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setQuery(""); setDateFrom(""); setDateTo(""); }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
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
                    <TableCell>
                      <SaleDetailDialog
                        saleId={r.id}
                        customerName={r.customer_name}
                        createdAt={r.created_at}
                        saleTotal={r.total}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
