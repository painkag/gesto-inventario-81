import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/providers/error-boundary";

// Import page components  
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Inventory from "@/pages/Inventory-simple";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Reports from "@/pages/Reports";
import PDV from "@/pages/PDV-basic-hooks";
import Settings from "@/pages/Settings";
import Plans from "@/pages/Plans";
import NotFound from "@/pages/NotFound";
import Movements from "@/pages/Movements";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Dashboard routes with prefix */}
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/inventory" element={<Inventory />} />
          <Route path="/dashboard/sales" element={<Sales />} />
          <Route path="/dashboard/purchases" element={<Purchases />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/movements" element={<Movements />} />
          <Route path="/dashboard/pdv" element={<PDV />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/plans" element={<Plans />} />
          <Route path="/dashboard/plano" element={<Plans />} />
          
          {/* Legacy routes without prefix for backward compatibility */}
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pdv" element={<PDV />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plans" element={<Plans />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;