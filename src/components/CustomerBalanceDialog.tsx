import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, DollarSign, Calendar, Receipt, AlertTriangle, CheckCircle } from "lucide-react";
import { useCustomerBalance } from "@/features/payments/hooks";
import { fmtMoney } from "@/features/sales/utils";
import type { Customer } from "@/features/customers/types";

interface CustomerBalanceDialogProps {
  customer: Customer;
}

export default function CustomerBalanceDialog({ customer }: CustomerBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: balance } = useCustomerBalance(customer.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Customer Balance - {customer.name}</DialogTitle>
        </DialogHeader>
        
        {balance ? (
          <div className="space-y-6">
            {/* Balance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-warning" />
                    <span className="text-2xl font-bold">{fmtMoney(balance.total_outstanding)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    {balance.overdue_amount > 0 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-2xl font-bold text-destructive">{fmtMoney(balance.overdue_amount)}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-2xl font-bold text-success">₹0.00</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{fmtMoney(balance.total_sales)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Sales Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Pending Sales ({balance.pending_sales.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balance.pending_sales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sale ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balance.pending_sales.map((sale) => (
                        <TableRow key={sale.sale_id}>
                          <TableCell className="font-mono text-sm">
                            {sale.sale_id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(sale.sale_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {fmtMoney(sale.total_amount)}
                          </TableCell>
                          <TableCell className="text-success">
                            {fmtMoney(sale.total_paid)}
                          </TableCell>
                          <TableCell className="font-medium text-warning">
                            {fmtMoney(sale.balance_due)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                sale.payment_status === 'Paid' ? 'default' :
                                sale.payment_status === 'Overdue' ? 'destructive' :
                                sale.payment_status === 'Partial' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {sale.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                    <p className="text-lg font-medium">All payments up to date!</p>
                    <p className="text-sm">This customer has no pending payments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4" />
              <p>Loading balance information...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}