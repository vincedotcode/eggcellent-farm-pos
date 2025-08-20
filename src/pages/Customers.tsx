import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import AddCustomerDialog from "@/components/AddCustomerDialog";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks";
import type { Customer } from "@/features/customers/types";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 50;

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const params = useMemo(() => ({ search: searchTerm, limit: PAGE_SIZE, offset: 0 }), [searchTerm]);

  const { data, isLoading, isError, error } = useCustomers(params);
  const { toast } = useToast();
  const del = useDeleteCustomer(params);

  const customers: Customer[] = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <AddCustomerDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading customers…</div>}
          {isError && (
            <div className="p-4 text-sm text-destructive">
              {(error as any)?.message || "Failed to fetch customers."}
            </div>
          )}
          {!isLoading && customers.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No customers found.</div>
          )}

          {customers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer.email || "—"}</div>
                        <div className="text-muted-foreground">{customer.phone || "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer.address || "—"}</div>
                        <div className="text-muted-foreground">
                          {[customer.city, customer.state, customer.zip_code].filter(Boolean).join(", ") || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.type === "Wholesale" ? "default" : "secondary"}>
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "Active" ? "default" : "destructive"}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.total_orders ?? 0}</TableCell>
                    <TableCell className="font-medium">
                      ${Number(customer.total_spent ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await del.mutateAsync(customer.id);
                              toast({ title: "Customer deleted" });
                            } catch (e: any) {
                              toast({
                                title: "Delete failed",
                                description: e?.message || "Only admins can delete customers.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
};

export default Customers;
