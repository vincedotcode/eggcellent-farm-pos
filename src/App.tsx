import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>
          } />
          <Route path="/pos" element={
            <ProtectedRoute><Layout><POS /></Layout></ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>
          } />
          <Route path="/create-invoice" element={
            <ProtectedRoute><Layout><CreateInvoice /></Layout></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
</QueryClientProvider>
);

export default App;
