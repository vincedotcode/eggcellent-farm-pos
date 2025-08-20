import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import AddCustomerDialog from "@/components/AddCustomerDialog";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample customer data with addresses
  const customers = [
    {
      id: 1,
      name: "Fresh Mart Grocery",
      email: "orders@freshmart.com",
      phone: "+1 (555) 0123",
      type: "Wholesale",
      status: "Active",
      totalOrders: 45,
      totalSpent: "$12,450",
      address: "123 Market Street",
      city: "Downtown",
      state: "CA",
      zipCode: "90210"
    },
    {
      id: 2,
      name: "Sunny Side Cafe",
      email: "manager@sunnyside.com",
      phone: "+1 (555) 0124",
      type: "Retail",
      status: "Active",
      totalOrders: 28,
      totalSpent: "$3,240",
      address: "456 Oak Avenue",
      city: "Uptown",
      state: "CA",
      zipCode: "90211"
    },
    {
      id: 3,
      name: "Metro Restaurant Group",
      email: "procurement@metro.com",
      phone: "+1 (555) 0125",
      type: "Wholesale",
      status: "Inactive",
      totalOrders: 67,
      totalSpent: "$18,900",
      address: "789 Business Blvd",
      city: "Metro City",
      state: "CA",
      zipCode: "90212"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.email}</div>
                      <div className="text-muted-foreground">{customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.address}</div>
                      <div className="text-muted-foreground">{customer.city}, {customer.state} {customer.zipCode}</div>
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
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
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

export default Customers;