import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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

const App = () => {
  console.log('[APP] React object:', React);
  
  return (
    <AuthProvider>
      <div>
        <h1>App Loading Test</h1>
        <p>If you can see this, React is working</p>
      </div>
    </AuthProvider>
  );
};

export default App;