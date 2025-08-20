import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Eye, Download, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Sample invoice data
  const invoices = [
    {
      id: "INV-2024-001",
      customer: "Fresh Mart Grocery",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      amount: 1247.50,
      tax: 99.80,
      total: 1347.30,
      status: "Paid",
      items: [
        { name: "Grade A Large Eggs", quantity: 100, price: 2.99 },
        { name: "Free Range Large Eggs", quantity: 50, price: 4.49 }
      ]
    },
    {
      id: "INV-2024-002",
      customer: "Sunny Side Cafe",
      date: "2024-01-16",
      dueDate: "2024-02-16",
      amount: 223.60,
      tax: 17.89,
      total: 241.49,
      status: "Pending",
      items: [
        { name: "Grade AA Medium Eggs", quantity: 80, price: 2.79 }
      ]
    },
    {
      id: "INV-2024-003",
      customer: "Metro Restaurant Group",
      date: "2024-01-10",
      dueDate: "2024-02-10",
      amount: 1678.50,
      tax: 134.28,
      total: 1812.78,
      status: "Overdue",
      items: [
        { name: "Grade A Large Eggs", quantity: 200, price: 2.99 },
        { name: "Duck Eggs Large", quantity: 150, price: 6.99 }
      ]
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge variant="default" className="bg-success">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTotalRevenue = () => {
    return invoices
      .filter(inv => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const getPendingAmount = () => {
    return invoices
      .filter(inv => inv.status === "Pending")
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter(inv => inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Track and manage customer invoices</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/create-invoice")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-success">Paid Revenue</p>
              <p className="text-2xl font-bold text-success">${getTotalRevenue().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-warning">Pending</p>
              <p className="text-2xl font-bold text-warning">${getPendingAmount().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-destructive">Overdue</p>
              <p className="text-2xl font-bold text-destructive">${getOverdueAmount().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;