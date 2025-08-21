import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Plus, Edit, Trash2, DollarSign } from "lucide-react";
import AddCustomerDialog from "@/components/AddCustomerDialog";
import EditCustomerDialog from "@/components/EditCustomerDialog";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks";
import { useCustomerBalance } from "@/features/payments/hooks";
import type { Customer } from "@/features/customers/types";

const Customers = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const queryParams = { search, limit: 50, offset: 0 };
  const { data: customers = [], isLoading, isError, error } = useCustomers(queryParams);
  const deleteCustomer = useDeleteCustomer(queryParams);

  const handleDelete = async (customer: Customer) => {
    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast({
        title: "Customer deleted",
        description: `${customer.name} has been removed from your customer list.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting customer",
        description: error?.message ?? "There was a problem deleting the customer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Customer Management
          </h1>
          <p className="text-muted-foreground">Manage your customer relationships and track outstanding balances</p>
        </div>
        <AddCustomerDialog />
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading and Error States */}
          {isLoading && <div className="text-sm text-muted-foreground p-4">Loading customers...</div>}
          {isError && <div className="text-sm text-destructive p-4">{(error as any)?.message || "Failed to load customers."}</div>}

          {(!isLoading && customers.length === 0) ? (
            <div className="text-sm text-muted-foreground p-4">No customers found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} onDelete={handleDelete} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component for customer row to handle individual balance loading
function CustomerRow({ customer, onDelete }: { customer: Customer; onDelete: (customer: Customer) => void }) {
  const { data: balance } = useCustomerBalance(customer.id);
  
  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted-foreground">Customer #{customer.id.slice(0, 8)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{customer.email || "No email"}</p>
          <p className="text-sm text-muted-foreground">{customer.phone || "No phone"}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{customer.type}</Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm">{customer.address || "No address"}</p>
          <p className="text-sm text-muted-foreground">
            {customer.city && customer.state 
              ? `${customer.city}, ${customer.state} ${customer.zip_code || ''}`.trim()
              : "No location"
            }
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
          {customer.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm font-medium">{customer.total_orders || 0}</p>
          <p className="text-sm text-muted-foreground">${(customer.total_spent || 0).toFixed(2)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {balance ? (
            <>
              <p className="text-sm font-medium flex items-center gap-1">
                {balance.total_outstanding > 0 ? (
                  <>
                    <DollarSign className="h-3 w-3 text-warning" />
                    ${balance.total_outstanding.toFixed(2)}
                  </>
                ) : (
                  <span className="text-success">$0.00</span>
                )}
              </p>
              {balance.overdue_amount > 0 && (
                <p className="text-xs text-destructive">
                  ${balance.overdue_amount.toFixed(2)} overdue
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <EditCustomerDialog 
            customer={customer}
            onCustomerUpdated={() => {
              // Refresh will happen automatically via react-query
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {customer.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(customer)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default Customers;