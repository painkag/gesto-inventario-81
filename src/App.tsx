import React from "react";
import PDV from "./pages/PDV-basic-hooks";

const App = () => {
  console.log('[APP] Loading PDV with basic hooks...');
  
  return (
    <div className="min-h-screen">
      <PDV />
    </div>
  );
};

export default App;