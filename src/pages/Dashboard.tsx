import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { useCustomers } from "@/features/customers/hooks";
import { useSalesMetrics } from "@/features/sales/hooks";
import { useOutstandingBalances } from "@/features/payments/hooks";
import { useProducts } from "@/features/inventory/hooks";

const Dashboard = () => {
  // Fetch real data
  const { data: customers = [] } = useCustomers({ search: "", limit: 1000, offset: 0 });
  const { data: salesMetrics } = useSalesMetrics(7); // should return SalesMetrics | null as normalized above
  const { data: outstandingBalances = [] } = useOutstandingBalances();
  const { data: inventory = [] } = useProducts({ search: "", limit: 1000, offset: 0 });

  const currency = (n: number) =>
    Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtRange = (s?: string, e?: string) => {
    if (!s || !e) return "last 7 days";
    try {
      const sd = new Date(s), ed = new Date(e);
      const sStr = sd.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
      const eStr = ed.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
      return `${sStr} – ${eStr}`;
    } catch { return "last 7 days"; }
  };

  // Calculate metrics
  const totalCustomers = customers.length;
  const totalInventoryItems = inventory.length;
  const lowStockItems = inventory.filter(item => Number(item.stock) <= 10).length;
  const totalOutstanding = outstandingBalances.reduce((sum, c) => sum + Number(c.total_outstanding || 0), 0);
  const overdueCustomers = outstandingBalances.filter(c => Number(c.overdue_amount || 0) > 0).length;

  const rangeLabel = fmtRange(salesMetrics?.start_date, salesMetrics?.end_date);

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      description: `${customers.filter(c => c.status === "Active").length} active customers`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Inventory Items",
      value: totalInventoryItems.toLocaleString(),
      description: `${lowStockItems} items low stock`,
      icon: Package,
      color: "text-success",
    },
    // Weekly Sales (7d)
    {
      title: "Weekly Sales",
      value: `Rs ${currency(salesMetrics?.total_revenue ?? 0)}`,
      description: `${salesMetrics?.orders_count ?? 0} orders (${rangeLabel})`,
      icon: ShoppingCart,
      color: "text-accent",
    },
    // Paid (7d)
    {
      title: "Paid (7d)",
      value: `Rs ${currency(salesMetrics?.total_paid ?? 0)}`,
      description: `Outstanding Rs ${currency(salesMetrics?.outstanding ?? 0)} (${rangeLabel})`,
      icon: DollarSign,
      color: "text-primary",
    },
    // 7-day AOV
    {
      title: "7-day AOV",
      value: `Rs ${currency(salesMetrics?.avg_order_value ?? 0)}`,
      description: `Average order value (${rangeLabel})`,
      icon: BarChart3,
      color: "text-muted-foreground",
    },
    {
      title: "Outstanding Balance",
      value: `Rs ${currency(totalOutstanding)}`,
      description: `${overdueCustomers} customers overdue`,
      icon: DollarSign,
      color: "text-warning",
    },
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
                      <p className="text-sm font-medium">
                        {customer.customer_name} owes Rs {currency(customer.total_outstanding)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(customer.overdue_amount || 0) > 0
                          ? `Rs ${currency(customer.overdue_amount)} overdue`
                          : "Not overdue"}
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
              {salesMetrics && salesMetrics.total_revenue > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary-foreground">Weekly Performance</p>
                  <p className="text-xs text-muted-foreground">
                    {rangeLabel}: Rs {currency(salesMetrics.total_revenue)} revenue, {salesMetrics.orders_count} orders.
                    Paid Rs {currency(salesMetrics.total_paid)} • Outstanding Rs {currency(salesMetrics.outstanding)}
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
