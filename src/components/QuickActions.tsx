import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Zap, Package, CreditCard, RefreshCw } from "lucide-react";
import { useBulkUpdateLowStock, useMarkAllBalancesPaid } from "@/features/analytics/hooks";
import { toast } from "sonner";

export default function QuickActions() {
  const bulkUpdateMutation = useBulkUpdateLowStock();
  const markPaidMutation = useMarkAllBalancesPaid();

  const handleBulkUpdateStock = async () => {
    try {
      await bulkUpdateMutation.mutateAsync();
      toast.success("Low stock items updated successfully");
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  const handleMarkAllPaid = async () => {
    try {
      await markPaidMutation.mutateAsync();
      toast.success("All outstanding balances marked as paid");
    } catch (error) {
      toast.error("Failed to update balances");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Update Low Stock
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Low Stock Items</AlertDialogTitle>
              <AlertDialogDescription>
                This will automatically restock all items that are below their minimum stock level to their recommended quantity. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkUpdateStock}
                disabled={bulkUpdateMutation.isPending}
              >
                {bulkUpdateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Clear Balances
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark All Balances as Paid</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark all outstanding customer balances as paid. This action is irreversible and should only be used for mass payment reconciliation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleMarkAllPaid}
                disabled={markPaidMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {markPaidMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Mark All Paid"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}