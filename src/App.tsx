import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import SystemBlockedGuard from "@/components/auth/SystemBlockedGuard";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Movements from "./pages/Movements";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import CheckoutProcessing from "./pages/CheckoutProcessing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import PDV from "./pages/PDV";
import Promotions from "./pages/Promotions";
import XmlImport from "./pages/XmlImport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SystemBlockedGuard>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/purchases" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/purchases/xml" element={
                <ProtectedRoute>
                  <XmlImport />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/movements" element={
                <ProtectedRoute>
                  <Movements />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/pdv" element={
                <ProtectedRoute>
                  <PDV />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/promotions" element={
                <ProtectedRoute>
                  <Promotions />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRole="OWNER">
                    <Settings />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/plano" element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRole="OWNER">
                    <Plans />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              } />
              
              {/* Public checkout processing */}
              <Route path="/checkout-processing" element={<CheckoutProcessing />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SystemBlockedGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
