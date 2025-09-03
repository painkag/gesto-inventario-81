import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import PDV from "./pages/PDV-simple";

const App = () => {
  console.log('[APP] React working, loading PDV...');
  
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <PDV />
      </div>
    </AuthProvider>
  );
};

export default App;