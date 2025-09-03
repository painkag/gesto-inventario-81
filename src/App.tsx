import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import PDV from "./pages/PDV-vanilla";

const App = () => {
  console.log('[APP] Loading vanilla PDV...');
  
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <PDV />
      </div>
    </AuthProvider>
  );
};

export default App;