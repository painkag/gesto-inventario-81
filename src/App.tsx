import React, { FC } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import PDV from "./pages/PDV";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Movements from "./pages/Movements";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import CheckoutProcessing from "./pages/CheckoutProcessing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
            <SystemBlockedGuard>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
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
              <Route path="/dashboard/pdv" element={
                <ProtectedRoute>
                  <PDV />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/purchases" element={
                <ProtectedRoute>
                  <Purchases />
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
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </SystemBlockedGuard>
          </BrowserRouter>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;