import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, FileText, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useCustomers } from "@/features/customers/hooks";
import { useSalesMetrics } from "@/features/sales/hooks";
import { useOutstandingBalances } from "@/features/payments/hooks";
import { useProducts } from "@/features/inventory/hooks";

const Dashboard = () => {
  // Fetch real data
  const { data: customers = [] } = useCustomers({ search: "", limit: 1000, offset: 0 });
  const { data: salesMetrics } = useSalesMetrics(7);
  const { data: outstandingBalances = [] } = useOutstandingBalances();
  const { data: inventory = [] } = useProducts({ search: "", limit: 1000, offset: 0 });

  // Calculate metrics
  const totalCustomers = customers.length;
  const totalInventoryItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock <= 10).length;
  const totalOutstanding = outstandingBalances.reduce((sum, customer) => sum + customer.total_outstanding, 0);
  const overdueCustomers = outstandingBalances.filter(customer => customer.overdue_amount > 0).length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      description: `${customers.filter(c => c.status === 'Active').length} active customers`,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Inventory Items",
      value: totalInventoryItems.toLocaleString(),
      description: `${lowStockItems} items low stock`,
      icon: Package,
      color: "text-success"
    },
    {
      title: "Today's Sales",
      value: `$${(salesMetrics?.revenue_today ?? 0).toFixed(2)}`,
      description: `${salesMetrics?.sales_today ?? 0} sales today`,
      icon: ShoppingCart,
      color: "text-accent"
    },
    {
      title: "Outstanding Balance",
      value: `$${totalOutstanding.toFixed(2)}`,
      description: `${overdueCustomers} customers overdue`,
      icon: DollarSign,
      color: "text-warning"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to EggPro ERP System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Outstanding Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outstandingBalances.length > 0 ? (
                outstandingBalances.slice(0, 3).map((customer) => (
                  <div key={customer.customer_id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{customer.customer_name} owes ${customer.total_outstanding.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.overdue_amount > 0 ? `$${customer.overdue_amount.toFixed(2)} overdue` : 'Not overdue'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No outstanding balances</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems > 0 && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm font-medium text-warning-foreground">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">{lowStockItems} items are running low on stock</p>
                </div>
              )}
              {overdueCustomers > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive-foreground">Overdue Payments</p>
                  <p className="text-xs text-muted-foreground">{overdueCustomers} customers have overdue payments</p>
                </div>
              )}
              {salesMetrics && salesMetrics.revenue_7d > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary-foreground">Weekly Performance</p>
                  <p className="text-xs text-muted-foreground">
                    ${salesMetrics.revenue_7d.toFixed(2)} revenue from {salesMetrics.sales_count_7d} sales this week
                  </p>
                </div>
              )}
              {lowStockItems === 0 && overdueCustomers === 0 && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm font-medium text-success-foreground">All Good!</p>
                  <p className="text-xs text-muted-foreground">No urgent alerts at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;