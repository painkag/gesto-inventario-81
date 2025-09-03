import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login/>} />
        <Route element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/sales" element={<Sales/>} />
          <Route path="/inventory" element={<Inventory/>} />
        </Route>
        <Route path="/__probe" element={<button>ok</button>} />
        <Route path="*" element={<div style={{padding:24}}>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;