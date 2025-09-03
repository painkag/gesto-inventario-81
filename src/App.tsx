import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory-simple";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import PDV from "./pages/PDV-basic-hooks";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import NotFound from "./pages/NotFound";

const App = () => {
  console.log('App rendering...');
  
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
  );
};

export default App;