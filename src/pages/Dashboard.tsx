import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Store, Target, CreditCard, Percent, BarChart3, Activity } from "lucide-react";
import { useCustomerAnalytics, useInventoryAnalytics, useSalesAnalytics, useFinancialAnalytics, useTopProducts } from "@/features/analytics/hooks";

const fmtCurrency = (n?: number) => `Rs ${(n ?? 0).toFixed(2)}`;
const dash = (b?: boolean, s?: string | number) => (b ? "—" : String(s ?? "—"));

const Dashboard = () => {
  const { data: customerAnalytics, isLoading: caL }   = useCustomerAnalytics();
  const { data: inventoryAnalytics, isLoading: iaL }  = useInventoryAnalytics();
  const { data: salesAnalytics, isLoading: saL }      = useSalesAnalytics(30);
  const { data: financialAnalytics, isLoading: faL }  = useFinancialAnalytics();
  const { data: topProducts = [], isLoading: tpL }    = useTopProducts(5);

  const mainStats = [
    {
      title: "Total Customers",
      value: dash(caL, (customerAnalytics?.total_customers ?? 0).toLocaleString()),
      description: caL ? "—" : `${customerAnalytics?.active_customers ?? 0} active, ${customerAnalytics?.new_this_month ?? 0} new this month`,
      icon: Users,
      color: "text-primary",
      trend: caL ? "—" : (customerAnalytics?.new_this_month ? `+${customerAnalytics.new_this_month}` : "0"),
    },
    {
      title: "Inventory Items",
      value: dash(iaL, (inventoryAnalytics?.total_items ?? 0).toLocaleString()),
      description: iaL ? "—" : fmtCurrency(inventoryAnalytics?.total_inventory_value) + " total value",
      icon: Package,
      color: "text-success",
      trend: iaL ? "—" : (inventoryAnalytics?.low_stock_items ? `-${inventoryAnalytics.low_stock_items}` : "0"),
    },
    {
      title: "Monthly Revenue",
      value: dash(saL, fmtCurrency(salesAnalytics?.total_revenue)),
      description: saL ? "—" : `${salesAnalytics?.total_sales ?? 0} sales, ${fmtCurrency(salesAnalytics?.average_order_value)} AOV`,
      icon: TrendingUp,
      color: "text-accent",
      trend: saL ? "—" : (salesAnalytics?.growth_rate !== undefined ? `${salesAnalytics.growth_rate > 0 ? '+' : ''}${salesAnalytics.growth_rate.toFixed(1)}%` : "0%"),
    },
    {
      title: "Outstanding Balance",
      value: dash(faL, fmtCurrency(financialAnalytics?.total_outstanding)),
      description: faL ? "—" : `${financialAnalytics?.overdue_customers ?? 0} overdue, ${(financialAnalytics?.collection_rate ?? 100).toFixed(1)}% collection rate`,
      icon: CreditCard,
      color: "text-warning",
      trend: faL ? "—" : `Rs ${(financialAnalytics?.overdue_amount ?? 0).toFixed(2)}`,
    },
  ];

  const secondaryStats = [
    {
      title: "Today's Sales",
      value: dash(saL, fmtCurrency(salesAnalytics?.today_revenue)),
      description: saL ? "—" : `${salesAnalytics?.today_sales ?? 0} transactions`,
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Low Stock Items",
      value: dash(iaL, (inventoryAnalytics?.low_stock_items ?? 0).toString()),
      description: iaL ? "—" : `${inventoryAnalytics?.out_of_stock_items ?? 0} out of stock`,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      title: "Customer Types",
      value: dash(caL, Object.entries(customerAnalytics?.by_type ?? {}).length.toString()),
      description: caL ? "—" : `${customerAnalytics?.by_type?.retail ?? 0} retail, ${customerAnalytics?.by_type?.wholesale ?? 0} wholesale`,
      icon: Store,
      color: "text-secondary",
    },
    {
      title: "Collection Rate",
      value: dash(faL, `${(financialAnalytics?.collection_rate ?? 100).toFixed(1)}%`),
      description: faL ? "—" : `${financialAnalytics?.avg_collection_time ?? 0} days avg`,
      icon: Target,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to EggPro ERP System</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{stat.trend}</Badge>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Products
            </CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tpL ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.product_id ?? index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_quantity} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">Rs {Number(product.total_revenue ?? 0).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No sales data available</p>
            ))}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-success" />
              Financial Health
            </CardTitle>
            <CardDescription>Payment and collection metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span className="font-medium">{dash(faL, `${(financialAnalytics?.collection_rate ?? 100).toFixed(1)}%`)}</span>
              </div>
              <Progress value={faL ? 0 : (financialAnalytics?.collection_rate ?? 100)} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">{dash(faL, fmtCurrency((financialAnalytics?.total_outstanding ?? 0) - (financialAnalytics?.overdue_amount ?? 0)))}</p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{dash(faL, fmtCurrency(financialAnalytics?.overdue_amount))}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(inventoryAnalytics?.low_stock_items ?? 0) > 0 && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-warning" />
                  <p className="font-medium text-warning-foreground">Low Stock Alert</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {inventoryAnalytics?.low_stock_items} items need restocking
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {inventoryAnalytics?.out_of_stock_items} out of stock
                </Badge>
              </div>
            )}

            {(financialAnalytics?.overdue_customers ?? 0) > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-destructive" />
                  <p className="font-medium text-destructive-foreground">Overdue Payments</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {financialAnalytics?.overdue_customers} customers have overdue payments
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Rs {(financialAnalytics?.overdue_amount ?? 0).toFixed(2)} total
                </Badge>
              </div>
            )}

            {(salesAnalytics?.total_revenue ?? 0) > 0 && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="font-medium text-primary-foreground">Monthly Performance</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {fmtCurrency(salesAnalytics?.total_revenue)} revenue this month
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {(salesAnalytics?.growth_rate ?? 0) > 0 ? '+' : ''}{(salesAnalytics?.growth_rate ?? 0).toFixed(1)}% growth
                </Badge>
              </div>
            )}

            {((inventoryAnalytics?.low_stock_items ?? 0) === 0) &&
             ((financialAnalytics?.overdue_customers ?? 0) === 0) &&
             ((salesAnalytics?.total_revenue ?? 0) === 0) && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg col-span-full">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-success" />
                  <p className="font-medium text-success-foreground">All Systems Running Smoothly!</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  No urgent alerts at this time. Your business is operating efficiently.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
